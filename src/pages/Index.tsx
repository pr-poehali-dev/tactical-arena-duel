import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type GameState = 'menu' | 'lobby' | 'game';
type Player = {
  id: number;
  name: string;
  health: number;
  shields: number;
  ammo: number;
  position: { x: number; y: number };
  action?: 'move' | 'attack' | 'defend';
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [player1, setPlayer1] = useState<Player>({
    id: 1,
    name: 'Игрок 1',
    health: 6,
    shields: 2,
    ammo: 3,
    position: { x: 1, y: 1 }
  });
  const [player2, setPlayer2] = useState<Player>({
    id: 2,
    name: 'Игрок 2',
    health: 6,
    shields: 3,
    ammo: 3,
    position: { x: 4, y: 1 }
  });

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
          
          cells.push(
            <div
              key={`${x}-${y}`}
              className={`
                aspect-square border-2 border-gray-300 flex items-center justify-center text-2xl relative
                ${isLeftSide ? 'bg-secondary/20' : 'bg-primary/20'}
                ${isPlayer1 || isPlayer2 ? 'bg-game-arena text-white' : ''}
                hover:bg-gray-200 transition cursor-pointer
              `}
            >
              {isPlayer1 && (
                <div className="text-center">
                  <img 
                    src="/img/cf572254-80d0-4da6-9dbe-38d034741f13.jpg" 
                    alt="Player 1" 
                    className="w-12 h-12 rounded-full border-2 border-secondary"
                  />
                </div>
              )}
              {isPlayer2 && (
                <div className="text-center">
                  <img 
                    src="/img/8a95a4a6-d5ad-4f69-8b19-8645a0c4f54a.jpg" 
                    alt="Player 2" 
                    className="w-12 h-12 rounded-full border-2 border-primary"
                  />
                </div>
              )}
            </div>
          );
        }
      }
      return cells;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => setGameState('lobby')} 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900"
            >
              <Icon name="ArrowLeft" className="mr-2" />
              Выйти
            </Button>
            <h1 className="text-3xl font-bold text-white">Тактическая Арена</h1>
            <div className="text-white text-sm">
              Ход 1 • Фаза планирования
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Player 1 Stats */}
            <Card className="lg:col-span-3 shadow-xl border-0 bg-secondary/10 border-secondary">
              <CardHeader>
                <CardTitle className="text-secondary flex items-center">
                  🤖 {player1.name}
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
                  <Badge className="bg-game-ammo">{player1.ammo}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Game Arena */}
            <div className="lg:col-span-6">
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="grid grid-cols-6 gap-1 mb-4">
                    {renderGrid()}
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-3">Действия</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className="h-16 flex-col">
                        <Icon name="Move" className="mb-1" />
                        Движение
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <Icon name="Zap" className="mb-1" />
                        Атака
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <Icon name="Shield" className="mb-1" />
                        Защита
                      </Button>
                    </div>
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 h-12">
                      <Icon name="Play" className="mr-2" />
                      Выполнить ход
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Player 2 Stats */}
            <Card className="lg:col-span-3 shadow-xl border-0 bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="text-primary flex items-center">
                  🦾 {player2.name}
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
                  <Badge className="bg-game-ammo">{player2.ammo}</Badge>
                </div>
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