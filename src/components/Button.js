import React from "react";
const Button = ({ status, onStart, onRestart, onStop }) => {
  return (
    <div className="button">
      {status === "gameover" && (
        <button className="btn btn-gameover" onClick={onRestart}>
          gameover
        </button>
      )}
      {status === "init" && (
        <button className="btn btn-init" onClick={onStart}>
          start
        </button>
      )}
      {status === "suspended" && (
        <button className="btn btn-suspended" onClick={onStart}>
          start
        </button>
      )}
      {status === "playing" && (
        <button className="btn btn-playing" onClick={onStop}>
          stop
        </button>
      )}
    </div>
    //if文の書き方 &&の前が条件式 trueの時に&&以降が実行される
  );
};

export default Button;
