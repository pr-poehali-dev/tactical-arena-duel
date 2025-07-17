import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type GameState = 'menu' | 'lobby' | 'game';
type ActionType = 'move' | 'attack' | 'defend' | 'reload' | null;
type GamePhase = 'planning' | 'waiting' | 'execution' | 'results';

type Player = {
  id: number;
  name: string;
  health: number;
  shields: number;
  ammo: number;
  maxAmmo: number;
  position: { x: number; y: number };
  plannedAction?: {
    type: ActionType;
    targetPosition?: { x: number; y: number };
  };
  actionConfirmed: boolean;
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gamePhase, setGamePhase] = useState<GamePhase>('planning');
  const [currentTurn, setCurrentTurn] = useState(1);
  const [activePlayer, setActivePlayer] = useState(1);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [showValidMoves, setShowValidMoves] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const [player1, setPlayer1] = useState<Player>({
    id: 1,
    name: 'Игрок 1',
    health: 6,
    shields: 2,
    ammo: 3,
    maxAmmo: 6,
    position: { x: 1, y: 1 },
    actionConfirmed: false
  });
  
  const [player2, setPlayer2] = useState<Player>({
    id: 2,
    name: 'Игрок 2',
    health: 6,
    shields: 3,
    ammo: 3,
    maxAmmo: 6,
    position: { x: 4, y: 1 },
    actionConfirmed: false
  });

  // Проверка валидности хода
  const isValidMove = (player: Player, x: number, y: number) => {
    const isLeftSide = player.id === 1;
    const sideLimit = isLeftSide ? 2 : 3;
    const sideStart = isLeftSide ? 0 : 3;
    
    // Проверяем границы стороны
    if (isLeftSide && x > sideLimit) return false;
    if (!isLeftSide && x < sideStart) return false;
    
    // Проверяем границы поля
    if (x < 0 || x > 5 || y < 0 || y > 2) return false;
    
    // Проверяем, что клетка не занята
    const otherPlayer = player.id === 1 ? player2 : player1;
    if (otherPlayer.position.x === x && otherPlayer.position.y === y) return false;
    
    // Проверяем расстояние (можно двигаться только на соседние клетки)
    const distance = Math.abs(player.position.x - x) + Math.abs(player.position.y - y);
    return distance === 1;
  };

  // Проверка возможности атаки
  const canAttack = (attacker: Player, target: Player) => {
    return attacker.position.y === target.position.y && attacker.ammo > 0;
  };

  // Проверка готовности обеих игроков
  const checkBothPlayersReady = () => {
    return player1.actionConfirmed && player2.actionConfirmed;
  };

  // Обработка клика по клетке
  const handleCellClick = (x: number, y: number) => {
    if (gamePhase !== 'planning') return;
    
    const currentPlayer = activePlayer === 1 ? player1 : player2;
    if (currentPlayer.actionConfirmed) return;
    
    if (selectedAction === 'move') {
      if (isValidMove(currentPlayer, x, y)) {
        // Планируем движение
        if (activePlayer === 1) {
          setPlayer1(prev => ({
            ...prev,
            plannedAction: { type: 'move', targetPosition: { x, y } }
          }));
        } else {
          setPlayer2(prev => ({
            ...prev,
            plannedAction: { type: 'move', targetPosition: { x, y } }
          }));
        }
        setSelectedAction(null);
        setShowValidMoves(false);
      }
    }
  };

  // Планирование действия
  const planAction = (actionType: ActionType) => {
    const currentPlayer = activePlayer === 1 ? player1 : player2;
    if (currentPlayer.actionConfirmed) return;
    
    if (actionType === 'move') {
      setSelectedAction('move');
      setShowValidMoves(true);
      return;
    }
    
    if (actionType === 'attack') {
      const target = activePlayer === 1 ? player2 : player1;
      if (canAttack(currentPlayer, target)) {
        if (activePlayer === 1) {
          setPlayer1(prev => ({
            ...prev,
            plannedAction: { type: 'attack' }
          }));
        } else {
          setPlayer2(prev => ({
            ...prev,
            plannedAction: { type: 'attack' }
          }));
        }
      }
    }
    
    if (actionType === 'defend') {
      if (currentPlayer.shields > 0) {
        if (activePlayer === 1) {
          setPlayer1(prev => ({
            ...prev,
            plannedAction: { type: 'defend' }
          }));
        } else {
          setPlayer2(prev => ({
            ...prev,
            plannedAction: { type: 'defend' }
          }));
        }
      }
    }

    if (actionType === 'reload') {
      if (currentPlayer.ammo < currentPlayer.maxAmmo) {
        if (activePlayer === 1) {
          setPlayer1(prev => ({
            ...prev,
            plannedAction: { type: 'reload' }
          }));
        } else {
          setPlayer2(prev => ({
            ...prev,
            plannedAction: { type: 'reload' }
          }));
        }
      }
    }
  };

  // Подтверждение действия
  const confirmAction = () => {
    const currentPlayer = activePlayer === 1 ? player1 : player2;
    if (!currentPlayer.plannedAction) return;

    if (activePlayer === 1) {
      setPlayer1(prev => ({ ...prev, actionConfirmed: true }));
    } else {
      setPlayer2(prev => ({ ...prev, actionConfirmed: true }));
    }

    // Переключаем на другого игрока или переходим к ожиданию
    if (activePlayer === 1 && !player2.actionConfirmed) {
      setActivePlayer(2);
    } else if (activePlayer === 2 && !player1.actionConfirmed) {
      setActivePlayer(1);
    } else {
      // Оба игрока подтвердили действия
      setGamePhase('waiting');
      setTimeout(() => {
        setGamePhase('execution');
        executeActions();
      }, 1000);
    }
  };

  // Отмена действия
  const cancelAction = () => {
    const currentPlayer = activePlayer === 1 ? player1 : player2;
    if (currentPlayer.actionConfirmed) return;

    if (activePlayer === 1) {
      setPlayer1(prev => ({ ...prev, plannedAction: undefined }));
    } else {
      setPlayer2(prev => ({ ...prev, plannedAction: undefined }));
    }
    setSelectedAction(null);
    setShowValidMoves(false);
  };

  // Выполнение всех запланированных действий
  const executeActions = () => {
    const log: string[] = [];
    let newPlayer1 = { ...player1 };
    let newPlayer2 = { ...player2 };

    // Фаза 1: Движение
    if (newPlayer1.plannedAction?.type === 'move' && newPlayer1.plannedAction.targetPosition) {
      newPlayer1.position = newPlayer1.plannedAction.targetPosition;
      log.push(`${newPlayer1.name} переместился на позицию (${newPlayer1.position.x + 1}, ${newPlayer1.position.y + 1})`);
    }
    
    if (newPlayer2.plannedAction?.type === 'move' && newPlayer2.plannedAction.targetPosition) {
      newPlayer2.position = newPlayer2.plannedAction.targetPosition;
      log.push(`${newPlayer2.name} переместился на позицию (${newPlayer2.position.x + 1}, ${newPlayer2.position.y + 1})`);
    }

    // Фаза 2: Перезарядка
    if (newPlayer1.plannedAction?.type === 'reload') {
      const reloadAmount = Math.min(2, newPlayer1.maxAmmo - newPlayer1.ammo);
      newPlayer1.ammo += reloadAmount;
      log.push(`${newPlayer1.name} перезарядил оружие (+${reloadAmount} патронов)`);
    }

    if (newPlayer2.plannedAction?.type === 'reload') {
      const reloadAmount = Math.min(2, newPlayer2.maxAmmo - newPlayer2.ammo);
      newPlayer2.ammo += reloadAmount;
      log.push(`${newPlayer2.name} перезарядил оружие (+${reloadAmount} патронов)`);
    }

    // Фаза 3: Защита
    if (newPlayer1.plannedAction?.type === 'defend') {
      log.push(`${newPlayer1.name} поднял щит`);
    }
    
    if (newPlayer2.plannedAction?.type === 'defend') {
      log.push(`${newPlayer2.name} поднял щит`);
    }

    // Фаза 4: Атаки
    if (newPlayer1.plannedAction?.type === 'attack' && canAttack(newPlayer1, newPlayer2)) {
      newPlayer1.ammo--;
      if (newPlayer2.plannedAction?.type === 'defend' && newPlayer2.shields > 0) {
        newPlayer2.shields--;
        log.push(`${newPlayer1.name} атаковал, но ${newPlayer2.name} заблокировал урон щитом`);
      } else {
        newPlayer2.health--;
        log.push(`${newPlayer1.name} попал по ${newPlayer2.name}! Урон: 1`);
      }
    } else if (newPlayer1.plannedAction?.type === 'attack') {
      if (newPlayer1.ammo <= 0) {
        log.push(`${newPlayer1.name} попытался атаковать, но нет патронов!`);
      } else {
        log.push(`${newPlayer1.name} выстрелил в пустоту - противник не на линии огня`);
        newPlayer1.ammo--;
      }
    }
    
    if (newPlayer2.plannedAction?.type === 'attack' && canAttack(newPlayer2, newPlayer1)) {
      newPlayer2.ammo--;
      if (newPlayer1.plannedAction?.type === 'defend' && newPlayer1.shields > 0) {
        newPlayer1.shields--;
        log.push(`${newPlayer2.name} атаковал, но ${newPlayer1.name} заблокировал урон щитом`);
      } else {
        newPlayer1.health--;
        log.push(`${newPlayer2.name} попал по ${newPlayer1.name}! Урон: 1`);
      }
    } else if (newPlayer2.plannedAction?.type === 'attack') {
      if (newPlayer2.ammo <= 0) {
        log.push(`${newPlayer2.name} попытался атаковать, но нет патронов!`);
      } else {
        log.push(`${newPlayer2.name} выстрелил в пустоту - противник не на линии огня`);
        newPlayer2.ammo--;
      }
    }

    // Очищаем запланированные действия и сбрасываем подтверждения
    newPlayer1.plannedAction = undefined;
    newPlayer2.plannedAction = undefined;
    newPlayer1.actionConfirmed = false;
    newPlayer2.actionConfirmed = false;

    setPlayer1(newPlayer1);
    setPlayer2(newPlayer2);
    setExecutionLog(log);
    setGamePhase('results');

    // Проверка победы
    if (newPlayer1.health <= 0) {
      log.push(`🏆 ${newPlayer2.name} победил!`);
      setExecutionLog([...log]);
      return;
    } else if (newPlayer2.health <= 0) {
      log.push(`🏆 ${newPlayer1.name} победил!`);
      setExecutionLog([...log]);
      return;
    }

    // Переход к следующему ходу через 3 секунды
    setTimeout(() => {
      setCurrentTurn(prev => prev + 1);
      setActivePlayer(1);
      setGamePhase('planning');
      setExecutionLog([]);
      setSelectedAction(null);
      setShowValidMoves(false);
    }, 3000);
  };

  const renderMainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl border-0">
        <CardHeader className="space-y-4">
          <div className="text-6xl">⚔️</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TACTICAL RPG ARENA
          </CardTitle>
          <p className="text-gray-600">Дуэль на арене • Пошаговая тактика</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setGameState('lobby')} 
            className="w-full bg-primary hover:bg-primary/90 text-white text-lg h-12 rounded-xl transform transition hover:scale-105"
          >
            <Icon name="Play" className="mr-2" />
            Начать игру
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl transform transition hover:scale-105"
          >
            <Icon name="Settings" className="mr-2" />
            Настройки
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl transform transition hover:scale-105"
          >
            <Icon name="Trophy" className="mr-2" />
            Рейтинг
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderLobby = () => (
    <div className="min-h-screen bg-gradient-to-br from-tertiary to-primary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => setGameState('menu')} 
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-tertiary"
          >
            <Icon name="ArrowLeft" className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-white">Лобби</h1>
          <div></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Plus" className="mr-2 text-primary" />
                Создать игру
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setGameState('game')}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl"
              >
                Создать арену
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Search" className="mr-2 text-secondary" />
                Найти игру
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Арена #1</span>
                  <Badge variant="secondary">Ожидание</Badge>
                </div>
                <p className="text-sm text-gray-600">Игрок: AstroWarrior</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Арена #2</span>
                  <Badge variant="secondary">Ожидание</Badge>
                </div>
                <p className="text-sm text-gray-600">Игрок: SpaceKnight</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    const renderGrid = () => {
      const cells = [];
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 6; x++) {
          const isPlayer1 = player1.position.x === x && player1.position.y === y;
          const isPlayer2 = player2.position.x === x && player2.position.y === y;
          const isLeftSide = x < 3;
          const currentPlayer = activePlayer === 1 ? player1 : player2;
          const isValidMoveCell = showValidMoves && selectedAction === 'move' && isValidMove(currentPlayer, x, y);
          
          cells.push(
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              className={`
                aspect-square border-2 border-gray-300 flex items-center justify-center text-2xl relative
                ${isLeftSide ? 'bg-secondary/20' : 'bg-primary/20'}
                ${isPlayer1 || isPlayer2 ? 'bg-game-arena text-white' : ''}
                ${isValidMoveCell ? 'bg-green-300 border-green-500 cursor-pointer' : ''}
                ${selectedAction === 'move' && gamePhase === 'planning' ? 'hover:bg-gray-200' : ''}
                transition cursor-pointer
              `}
            >
              {isPlayer1 && (
                <div className="text-center">
                  <img 
                    src="/img/cf572254-80d0-4da6-9dbe-38d034741f13.jpg" 
                    alt="Player 1" 
                    className={`w-12 h-12 rounded-full border-2 ${player1.actionConfirmed ? 'border-green-500' : 'border-secondary'}`}
                  />
                  {player1.plannedAction && (
                    <div className="absolute -top-2 -right-2 text-xs bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {player1.plannedAction.type === 'move' && '🏃'}
                      {player1.plannedAction.type === 'attack' && '⚔️'}
                      {player1.plannedAction.type === 'defend' && '🛡️'}
                      {player1.plannedAction.type === 'reload' && '🔄'}
                    </div>
                  )}
                  {player1.actionConfirmed && (
                    <div className="absolute -bottom-2 -right-2 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              )}
              {isPlayer2 && (
                <div className="text-center">
                  <img 
                    src="/img/8a95a4a6-d5ad-4f69-8b19-8645a0c4f54a.jpg" 
                    alt="Player 2" 
                    className={`w-12 h-12 rounded-full border-2 ${player2.actionConfirmed ? 'border-green-500' : 'border-primary'}`}
                  />
                  {player2.plannedAction && (
                    <div className="absolute -top-2 -right-2 text-xs bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {player2.plannedAction.type === 'move' && '🏃'}
                      {player2.plannedAction.type === 'attack' && '⚔️'}
                      {player2.plannedAction.type === 'defend' && '🛡️'}
                      {player2.plannedAction.type === 'reload' && '🔄'}
                    </div>
                  )}
                  {player2.actionConfirmed && (
                    <div className="absolute -bottom-2 -right-2 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              )}
              {isValidMoveCell && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          );
        }
      }
      return cells;
    };

    const getPhaseText = () => {
      if (gamePhase === 'planning') {
        const currentPlayer = activePlayer === 1 ? player1 : player2;
        if (currentPlayer.actionConfirmed) {
          return `Ход ${currentTurn} • Ожидание ${activePlayer === 1 ? player2.name : player1.name}`;
        }
        return `Ход ${currentTurn} • ${currentPlayer.name} планирует`;
      }
      if (gamePhase === 'waiting') {
        return `Ход ${currentTurn} • Подготовка к выполнению`;
      }
      if (gamePhase === 'execution') {
        return `Ход ${currentTurn} • Выполнение действий`;
      }
      if (gamePhase === 'results') {
        return `Ход ${currentTurn} • Результаты`;
      }
    };

    const currentPlayer = activePlayer === 1 ? player1 : player2;
    const canConfirmAction = currentPlayer.plannedAction && !currentPlayer.actionConfirmed;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => {
                setGameState('lobby');
                // Сброс игры
                setPlayer1(prev => ({ 
                  ...prev, 
                  health: 6, 
                  shields: 2, 
                  ammo: 3, 
                  position: { x: 1, y: 1 }, 
                  plannedAction: undefined,
                  actionConfirmed: false 
                }));
                setPlayer2(prev => ({ 
                  ...prev, 
                  health: 6, 
                  shields: 3, 
                  ammo: 3, 
                  position: { x: 4, y: 1 }, 
                  plannedAction: undefined,
                  actionConfirmed: false 
                }));
                setCurrentTurn(1);
                setActivePlayer(1);
                setGamePhase('planning');
                setExecutionLog([]);
                setSelectedAction(null);
                setShowValidMoves(false);
              }} 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900"
            >
              <Icon name="ArrowLeft" className="mr-2" />
              Выйти
            </Button>
            <h1 className="text-3xl font-bold text-white">Тактическая Арена</h1>
            <div className="text-white text-sm">
              {getPhaseText()}
            </div>
          </div>

          {/* Лог выполнения */}
          {executionLog.length > 0 && (
            <Card className="mb-6 shadow-xl border-0">
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Результаты хода:</h3>
                <div className="space-y-1">
                  {executionLog.map((entry, index) => (
                    <div key={index} className="text-sm">
                      {entry}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Player 1 Stats */}
            <Card className={`lg:col-span-3 shadow-xl border-0 bg-secondary/10 border-secondary ${activePlayer === 1 && gamePhase === 'planning' && !player1.actionConfirmed ? 'ring-4 ring-secondary' : ''}`}>
              <CardHeader>
                <CardTitle className="text-secondary flex items-center">
                  🤖 {player1.name}
                  {activePlayer === 1 && gamePhase === 'planning' && !player1.actionConfirmed && <span className="ml-2 text-xs">• Ход</span>}
                  {player1.actionConfirmed && <span className="ml-2 text-xs text-green-500">✓ Готов</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-health mr-1">❤️</span> Здоровье
                  </span>
                  <Badge variant="destructive">{player1.health}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-shield mr-1">🛡️</span> Щиты
                  </span>
                  <Badge className="bg-game-shield">{player1.shields}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-ammo mr-1">⚫</span> Патроны
                  </span>
                  <Badge className="bg-game-ammo">{player1.ammo}/{player1.maxAmmo}</Badge>
                </div>
                {player1.plannedAction && (
                  <div className="text-xs bg-secondary/20 p-2 rounded">
                    Запланировано: {player1.plannedAction.type === 'move' && 'Движение'}
                    {player1.plannedAction.type === 'attack' && 'Атака'}
                    {player1.plannedAction.type === 'defend' && 'Защита'}
                    {player1.plannedAction.type === 'reload' && 'Перезарядка'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Arena */}
            <div className="lg:col-span-6">
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="grid grid-cols-6 gap-1 mb-4">
                    {renderGrid()}
                  </div>
                  
                  {gamePhase === 'planning' && !currentPlayer.actionConfirmed && (
                    <div className="border-t pt-4">
                      <h3 className="font-bold mb-3">
                        Действия {currentPlayer.name}
                      </h3>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <Button 
                          variant={selectedAction === 'move' ? 'default' : 'outline'} 
                          className="h-16 flex-col"
                          onClick={() => planAction('move')}
                        >
                          <Icon name="Move" className="mb-1" />
                          Движение
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-16 flex-col"
                          onClick={() => planAction('attack')}
                          disabled={currentPlayer.ammo === 0}
                        >
                          <Icon name="Zap" className="mb-1" />
                          Атака
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-16 flex-col"
                          onClick={() => planAction('defend')}
                          disabled={currentPlayer.shields === 0}
                        >
                          <Icon name="Shield" className="mb-1" />
                          Защита
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-16 flex-col"
                          onClick={() => planAction('reload')}
                          disabled={currentPlayer.ammo >= currentPlayer.maxAmmo}
                        >
                          <Icon name="RotateCcw" className="mb-1" />
                          Перезарядка
                        </Button>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90 h-12"
                          onClick={confirmAction}
                          disabled={!canConfirmAction}
                        >
                          <Icon name="Check" className="mr-2" />
                          Подтвердить действие
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-12"
                          onClick={cancelAction}
                          disabled={!currentPlayer.plannedAction}
                        >
                          <Icon name="X" className="mr-2" />
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}

                  {gamePhase === 'planning' && currentPlayer.actionConfirmed && (
                    <div className="border-t pt-4 text-center">
                      <div className="text-lg font-bold mb-2 text-green-600">Действие подтверждено</div>
                      <div className="text-sm text-gray-600">Ожидание противника...</div>
                    </div>
                  )}
                  
                  {gamePhase === 'waiting' && (
                    <div className="border-t pt-4 text-center">
                      <div className="text-lg font-bold mb-2">Подготовка к выполнению...</div>
                      <div className="text-sm text-gray-600">Оба игрока готовы</div>
                    </div>
                  )}

                  {gamePhase === 'execution' && (
                    <div className="border-t pt-4 text-center">
                      <div className="text-lg font-bold mb-2">Выполнение действий...</div>
                      <div className="text-sm text-gray-600">Все действия выполняются одновременно</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Player 2 Stats */}
            <Card className={`lg:col-span-3 shadow-xl border-0 bg-primary/10 border-primary ${activePlayer === 2 && gamePhase === 'planning' && !player2.actionConfirmed ? 'ring-4 ring-primary' : ''}`}>
              <CardHeader>
                <CardTitle className="text-primary flex items-center">
                  🦾 {player2.name}
                  {activePlayer === 2 && gamePhase === 'planning' && !player2.actionConfirmed && <span className="ml-2 text-xs">• Ход</span>}
                  {player2.actionConfirmed && <span className="ml-2 text-xs text-green-500">✓ Готов</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-health mr-1">❤️</span> Здоровье
                  </span>
                  <Badge variant="destructive">{player2.health}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-shield mr-1">🛡️</span> Щиты
                  </span>
                  <Badge className="bg-game-shield">{player2.shields}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-game-ammo mr-1">⚫</span> Патроны
                  </span>
                  <Badge className="bg-game-ammo">{player2.ammo}/{player2.maxAmmo}</Badge>
                </div>
                {player2.plannedAction && (
                  <div className="text-xs bg-primary/20 p-2 rounded">
                    Запланировано: {player2.plannedAction.type === 'move' && 'Движение'}
                    {player2.plannedAction.type === 'attack' && 'Атака'}
                    {player2.plannedAction.type === 'defend' && 'Защита'}
                    {player2.plannedAction.type === 'reload' && 'Перезарядка'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Rubik, sans-serif' }}>
      {gameState === 'menu' && renderMainMenu()}
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'game' && renderGame()}
    </div>
  );
};

export default Index;