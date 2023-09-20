export const difference = (arrayA:string[], arrayB:string[]) : string[] => {
    const setA = new Set(arrayA);
    const setB = new Set(arrayB);
    const differenceSet = new Set();
  
    setA.forEach(item => {
      if (!setB.has(item)) differenceSet.add(item);
    });
    
    return [...differenceSet] as string[];
  }
  