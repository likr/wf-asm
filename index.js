module.exports = function WFModule(stdlib, foreign, heap) {
  "use asm";

  var buffer = new stdlib.Uint32Array(heap);
  var imul = stdlib.Math.imul;
  var maxLength = 0x00ffffff;

  function warshallFloyd(nv) {
    nv = nv | 0;

    var i = 0,
        j = 0,
        k1 = 0,
        k2 = 0,
        rowStop = 0,
        colStop = 0,
        rowStep = 0,
        colStep = 0,
        l1 = 0,
        l2 = 0;

    colStop = nv << 2;
    rowStop = imul(nv, nv) << 2 | 0;
    colStep = 1 << 2 | 0;
    rowStep = nv << 2 | 0;

    for (i = 0; (i | 0) < (rowStop | 0); i = i + rowStep | 0) {
      for (j = 0; (j | 0) < (colStop | 0); j = j + colStep | 0) {
        if ((buffer[i + j >> 2] | 0) == 0) {
          buffer[i + j >> 2] = maxLength;
        }
      }
    }

    for (i = 0; (i | 0) < (rowStop | 0); i = i + rowStep | 0) {
      for (j = 0; (j | 0) < (colStop | 0); j = j + colStep | 0) {
        l1 = buffer[i + j >> 2] | 0;
        for (k1 = 0, k2 = 0; (k1 | 0) < (colStop | 0); k1 = k1 + colStep | 0, k2 = k2 + rowStep | 0) {
          l2 = (buffer[i + k1 >> 2] | 0) + (buffer[k2 + j >> 2] | 0) | 0;
          if ((l2 | 0) < (l1 | 0)) {
            buffer[i + j >> 2] = l2 | 0;
          }
        }
      }
    }
  }

  return {
    warshallFloyd: warshallFloyd
  };
};
