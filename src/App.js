import React, { useCallback, useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import Field from "./components/Field";
import Button from "./components/Button";
import ManipulationPanel from "./components/ManipulationPanel";
import { initFields, getFoodPosition } from "./utils/index";

const initialPosition = { x: 17, y: 17 };
const initialValues = initFields(35, initialPosition); //初期値
const defaultInterval = 100;

//オブジェクトで色々定義
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
//それぞれの方向に進めるようにする
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

//壁に当たったかの判定　マイナスor FieldSizeを超える場合
const isCollision = (fieldSize, position) => {
  if (position.y < 0 || position.x < 0) {
    return true;
  }

  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true;
  }
  return false;
};

const isEatingMySelf = (fields, position) => {
  return fields[position.y][position.x] === "snake";
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
      //スネークの長さが0,stateがplaying意外ならreturn
      return;
    }
    const canContinue = handleMoving();
    if (!canContinue) {
      setStatus(GameStatus.gameover);
    }
  }, [tick]);
  // console.log(status); //tickを使い常にゲームの状態を把握している 同行のconsoleで見たら理解できる

  const onStart = () => setStatus(GameStatus.playing); // initからplayingへ

  //GameOver時のリセット処理
  const onRestart = () => {
    timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, defaultInterval);
    setDirection(Direction.up);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setFields(initFields(35, initialPosition));
  };

  //パフォーマンス向上のためのuseCallback レンダー毎に読み込むのではなく第2引数の[direction, status]に変更があった時のみ関数を読み込む
  const onChangeDirection = useCallback(
    (newDirection) => {
      if (status !== GameStatus.playing) {
        return direction;
      }
      // console.log(direction); //console 進んでいた方向
      // console.log(newDirection); // console 次に入力された方向
      if (OppositeDirection[direction] === newDirection) {
        //オブジェクトには[]でもアクセス可能
        //例：upならOppositeはdownこの例では左辺はdown 次に入力された方向がdownなら無効 進行方向の逆は入力できないって感じ
        return;
      }
      setDirection(newDirection);
    },
    [direction, status]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      console.log(newDirection);
      if (!newDirection) {
        //カーソル以外のキーはundefindを返す
        return;
      }
      onChangeDirection(newDirection);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown); //パフォーマンス向上のためコンポーネントが死んだ時イベントリスナを解除する
  }, [onChangeDirection]);

  const handleMoving = () => {
    const { x, y } = body[0]; //bodyはスネークの長さ
    const delta = Delta[direction];
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y,
    };
    if (
      isCollision(fields.length, newPosition) ||
      isEatingMySelf(fields, newPosition)
    ) {
      //GameOverかの確認
      return false;
    }
    const newBody = [...body]; //破壊的変更を加える前にコピーをとる
    if (fields[newPosition.y][newPosition.x] !== "food") {
      const removingTrack = newBody.pop();
      fields[removingTrack.y][removingTrack.x] = "";
    } else {
      const food = getFoodPosition(fields.length, [...newBody, newPosition]);
      fields[food.y][food.x] = "food"; //2回目以降の餌を出現させる
    }
    fields[newPosition.y][newPosition.x] = "snake"; //スネークの長さを増やす
    newBody.unshift(newPosition); //配列の先頭にスネークを加える（破壊的変更）
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
