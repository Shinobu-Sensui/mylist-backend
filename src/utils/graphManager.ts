import { generateFiles, getListData } from "../bdd/bdd.js";

let graphInfo = getListData()

export  function getGraphInfo() {
    return  graphInfo;
}

export async function refreshGraphInfo() {
   graphInfo = getListData()
   return true
}