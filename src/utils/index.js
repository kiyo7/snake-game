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
