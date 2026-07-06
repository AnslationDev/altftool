import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import carrerbook from "./carrerbook/config";
import myluckydeal from "./myluckydeal/config";
import anternet from "./anternet/config";

export const PROJECTS = {
    altftool,
    leadtree,
    carrerbook,
    myluckydeal,
    anternet,
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};