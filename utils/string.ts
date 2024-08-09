export const slugify = (str: String) => {
  return str.toLowerCase().replace(/ /g, "-");
};
