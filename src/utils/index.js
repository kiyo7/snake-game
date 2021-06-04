export const getFoodPosition = (fieldSize, excludes) => {
  //餌をランダムな場所に出現させる

  while (true) {
    const x = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;
    const y = Math.floor(Math.random() * (fieldSize - 1 - 1)) + 1;
    const conflict = excludes.some((item) => item.x === x && item.y === y);

    if (!conflict) {
      return { x, y };
    }
  }
};
export const initFields = (fieldSize, snake) => {
  //fieldを作る
  const fields = [];
  for (let i = 0; i < fieldSize; i++) {
    const cols = new Array(fieldSize).fill("");
    fields.push(cols);
  }
  fields[snake.x][snake.y] = "snake";
  const food = getFoodPosition(fieldSize, [snake]);
  console.log(food);
  fields[food.y][food.x] = "food";

  return fields;
};

//壁に当たったかの判定 マイナスor FieldSizeを超える場合
export const isCollision = (fieldSize, position) => {
  if (position.y < 0 || position.x < 0) {
    return true;
  }

  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true;
  }
  return false;
};

export const isEatingMySelf = (fields, position) => {
  //自分を食べてしまった時の処理
  return fields[position.y][position.x] === "snake";
};
