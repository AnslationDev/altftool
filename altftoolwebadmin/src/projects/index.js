import alphobia from "./alphobia/config";
import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import smartlucky from "./smartlucky/config";
import marketys from "./marketys/config";
import carrerbook from "./carrerbook/config";
import myluckydeal from "./myluckydeal/config";
import anternet from "./anternet/config";
import growvibe from "./growvibe/config";

export const PROJECTS = {
  altftool,
  leadtree,
  smartlucky,
  alphobia,
  marketys,
  carrerbook,
  myluckydeal,
  anternet,
  growvibe,
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};