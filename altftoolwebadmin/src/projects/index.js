import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import carrerbook from "./carrerbook/config";
import myluckydeal from "./myluckydeal/config";
import anternet from "./anternet/config";
import growvibe from "./growvibe/config";


export const PROJECTS = {
    altftool,
    leadtree,
    carrerbook,
    myluckydeal,
    anternet,
    growvibe,
    
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};