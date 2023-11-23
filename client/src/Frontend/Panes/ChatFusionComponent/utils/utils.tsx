enum monthEnum {
  'Jan' = 1,
  'Feb' = 2,
  'Mar' = 3,
  'Apr' = 4,
  'May' = 5,
  'Jun' = 6,
  'Jul' = 7,
  'Aug' = 8,
  'Sept' = 9,
  'Oct' = 10,
  'Nov' = 11,
  'Dec' = 12,
}
export function newDateFormat(time: number, format?: string) {
  const t = new Date(time);
  format = format || 'Y-m-d h:i:s';
  const year = t.getFullYear();
  const month = monthEnum[t.getMonth() + 1];
  const day = t.getDate();
  const hours = t.getHours();
  const minutes = t.getMinutes();
  const seconds = t.getSeconds();

  const hash = {
    y: year,
    m: month,
    d: day,
    h: hours,
    i: minutes,
    s: seconds,
  };
  // 是否补 0
  const isAddZero = (o: string) => {
    return /M|D|H|I|S/.test(o);
  };
  return format.replace(/\w/g, (o) => {
    // @ts-ignore
    const rt = hash[o.toLocaleLowerCase()];
    if (typeof rt === 'string') return rt;
    return rt >= 10 || isAddZero(o) ? rt : `0${rt}`;
  });
}

// date-fns
/**
 * 日期格式化
 * @param time
 * @param format
 */
export function dateFormat(time: number, format?: string) {
  const t = new Date(time);
  format = format || 'Y-m-d h:i:s';
  const year = t.getFullYear();
  const month = t.getMonth() + 1;
  const day = t.getDate();
  const hours = t.getHours();
  const minutes = t.getMinutes();
  const seconds = t.getSeconds();

  const hash = {
    y: year,
    m: month,
    d: day,
    h: hours,
    i: minutes,
    s: seconds,
  };
  // 是否补 0
  const isAddZero = (o: string) => {
    return /M|D|H|I|S/.test(o);
  };
  return format.replace(/\w/g, (o) => {
    // @ts-ignore
    const rt = hash[o.toLocaleLowerCase()];
    return rt >= 10 || isAddZero(o) ? rt : `0${rt}`;
  });
}

export function getShortAddress(address: any, num?: 5, endNum?: 4) {
  const _endNum = endNum ? endNum : 4;
  const strLength = address.length;
  return address.substring(0, num) + '...' + address.substring(strLength - _endNum, strLength);
}
