export function removeEmptyPathAndAddToZip(files: { path: string; data: Buffer; }[], zip: any) {
  let paths = files.map(it => it.path.split("/"));
  // find the path parts that all of the files have in common

  let commonPath = [];

  // find the path prefix that is commong for all files
  if (files.length === 1) {
    commonPath = paths[0].slice(0, paths[0].length - 1);
  } else {
    while (true) {
      let firstPath = paths[0];
      let common = true;
      for (let i = 0; i < paths.length; i++) {
        if (paths[i][0] !== firstPath[0]) {
          common = false;
          break;
        }
      }

      if (common) {
        commonPath.push(firstPath[0]);
        paths.forEach(it => it.splice(0, 1));
      } else {
        break;
      }
    }
  }
  // remove that common part from all of the files

  let commonPathLength = commonPath.length;
  files.forEach(it => {
    let path = it.path.split("/");
    path.splice(0, commonPathLength);
    it.path = path.join("/");


    zip.file(it.path, it.data);
  });
}