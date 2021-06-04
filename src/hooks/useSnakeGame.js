import { useCallback, useEffect, useState } from "react";
import {
  defaultInterval,
  defaultDifficulty,
  initialPosition,
  initialValues,
  Delta,
  Difficulty,
  Direction,
  DirectionKeyCodeMap,
  GameStatus,
  OppositeDirection,
} from "../constants/index";

import {
  initFields,
  isCollision,
  isEatingMySelf,
  getFoodPosition,
} from "../utils/index";

let timer = null;

const unsubscribe = () => {
  if (!timer) {
    return;
  }
  clearInterval(timer); //タイマーの削除
};

const useSnakeGame = () => {
  const [fields, setFields] = useState(initialValues);
  const [body, setBody] = useState([]);
  const [status, setStatus] = useState(GameStatus.init);
  const [direction, setDirection] = useState(Direction.up);
  const [difficulty, setDifficulty] = useState(defaultDifficulty);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setBody([initialPosition]); // positionの初期値を初回レンダリング時に設定
    const interval = Difficulty[difficulty - 1];
    timer = setInterval(() => {
      // ゲームの中の時間を管理する
      setTick((tick) => tick + 1);
    }, interval);
    return unsubscribe; //コンポーネントが消えるタイミングで実行（今回は、サイトが更新された時）
  }, [difficulty]);

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
  // console.log(status); //tickを使い常にゲームの状態を把握している 同行のconsoleで見たら理解しやすい

  const start = () => setStatus(GameStatus.playing); // ゲームスタート

  const stop = () => setStatus(GameStatus.suspended); //一時停止

  //GameOver時のリセット処理
  const reload = () => {
    timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, defaultInterval);
    setDirection(Direction.up);
    setStatus(GameStatus.init);
    setBody([initialPosition]);
    setFields(initFields(35, initialPosition));
  };

  //パフォーマンス向上のためのuseCallback レンダー毎に読み込むのではなく第2引数の[direction, status]に変更があった時のみ関数を読み込む
  const updateDirection = useCallback(
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

  const updateDifficulty = useCallback(
    (difficulty) => {
      if (status !== GameStatus.init) {
        //難易度の変更はinit時のみ受付
        return;
      }
      if (difficulty < 1 || difficulty > Difficulty.length) {
        return;
      }
      setDifficulty(difficulty);
    },
    [status]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];

      if (!newDirection) {
        //カーソル以外のキーはundefindを返す
        return;
      }
      updateDirection(newDirection);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown); //パフォーマンス向上のためコンポーネントが死んだ時イベントリスナを解除する
  }, [updateDirection]);

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

  return {
    body,
    difficulty,
    fields,
    status,
    start,
    stop,
    reload,
    updateDirection,
    updateDifficulty,
  };
};

export default useSnakeGame;
