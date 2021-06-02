import React from "react";

const Field = ({ fields }) => {
  //fieldは全体 35 * 35
  return (
    <div className="field">
      {fields.map((row) => {
        //rowは一列 35個
        return row.map((column) => {
          //columnはrowから1つずつとクラスを与える
          return <div className={`dots ${column}`}></div>;
        });
      })}
    </div>
  );
};

export default Field;
