import React, { useCallback, useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import Field from "./components/Field";
import Button from "./components/Button";
import ManipulationPanel from "./components/ManipulationPanel";
import { initFields, getFoodPosition } from "./utils/index";

const initialPosition = { x: 17, y: 17 };
const initialValues = initFields(35, initialPosition); //初期値
const defaultInterval = 100;

const GameStatus = Object.freeze({
  init: "init",
  playing: "playing",
  suspended: "suspended",
  gameover: "gameover",
});

const Direction = Object.freeze({
  up: "up",
  right: "right",
  left: "left",
  down: "down",
});

const DirectionKeyCodeMap = Object.freeze({
  37: Direction.left,
  38: Direction.up,
  39: Direction.right,
  40: Direction.down,
});

const OppositeDirection = Object.freeze({
  up: "down",
  right: "left",
  left: "right",
  down: "up",
});

const Delta = Object.freeze({
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
});

let timer = undefined;

const unsubscribe = () => {
  if (!timer) {
    return;
  }
  clearInterval(timer); //タイマーの削除
};

const isCollision = (fieldSize, position) => {
  if (position.y < 0 || position.x < 0) {
    return true;
  }

  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true;
  }
  return false;
};

function App() {
  const [fields, setFields] = useState(initialValues); //初期値を代入
  const [body, setBody] = useState([]);
  const [status, setStatus] = useState(GameStatus.init);
  const [direction, setDirection] = useState(Direction.up);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setBody([initialPosition]); // positionの初期値を初回レンダリング時に設定
    timer = setInterval(() => {
      // ゲームの中の時間を管理する
      setTick((tick) => tick + 1);
    }, defaultInterval);
    return unsubscribe; //コンポーネントが消えるタイミングで実行（今回は、サイトが更新された時）
  }, []);

  useEffect(() => {
    if (body.length === 0 || status !== GameStatus.playing) {
      return;
    }
    const canContinue = handleMoving();
    if (!canContinue) {
      setStatus(GameStatus.gameover);
    }
  }, [tick]);

  const onStart = () => setStatus(GameStatus.playing);

  const onRestart = () => {
    timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, defaultInterval);
    setDirection(Direction.up);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setFields(initFields(35, initialPosition));
  };

  const onChangeDirection = useCallback(
    (newDirection) => {
      if (status !== GameStatus.playing) {
        return direction;
      }
      console.log(direction);
      if (OppositeDirection[direction] === newDirection) {
        return;
      }
      setDirection(newDirection);
    },
    [direction, status]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      if (!newDirection) {
        return;
      }
      onChangeDirection(newDirection);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onChangeDirection]);

  const handleMoving = () => {
    const { x, y } = body[0];
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y,
    };
    if (isCollision(fields.length, newPosition)) {
      return false;
    }
    const newBody = [...body];
    if (fields[newPosition.y][newPosition.x] !== "food") {
      const removingTrack = newBody.pop();
      fields[removingTrack.y][removingTrack.x] = "";
    } else {
      const food = getFoodPosition(fields.length, [...newBody, newPosition]);
      fields[food.y][food.x] = "food";
    }
    fields[newPosition.y][newPosition.x] = "snake";
    newBody.unshift(newPosition);

    setBody(newBody);
    setFields(fields);
    return true;
  };

  return (
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
        </div>
        <Navigation />
      </header>
      <main className="main">
        <Field fields={fields} />
      </main>

      <footer className="footer">
        <Button status={status} onStart={onStart} onRestart={onRestart} />
        <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
