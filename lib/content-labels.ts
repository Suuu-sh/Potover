const labels:Record<string,string>={Beginner:'初級',Intermediate:'中級',Advanced:'上級',Japanese:'日本語',English:'英語',Preflop:'プリフロップ',Flop:'フロップ',Turn:'ターン',River:'リバー',Bluff:'ブラフ',Exploit:'エクスプロイト','Cash Game':'キャッシュ','cash-game':'キャッシュ'};
export const contentLabel=(value:string)=>labels[value]??Object.entries(labels).find(([key])=>key.toLowerCase()===value.toLowerCase())?.[1]??value;
