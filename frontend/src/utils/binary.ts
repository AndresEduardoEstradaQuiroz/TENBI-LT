
export function binarySearch(array: number[], item: number): number | null {
  let init = 0;
  let finish = array.length - 1;

  while (init <= finish) {
    const mid = Math.floor((init + finish) / 2);
    const result = array[mid];

    if (item === result) return mid;
    if (result > item) {
      finish = mid - 1;
    } else {
      init = mid + 1;
    }
  }

  return null;
}


console.log(binarySearch([1, 2, 3, 4, 5, 6, 7, 8, 12, 15, 17, 21, 34, 56, 57, 58, 58, 70, 101], 56));
