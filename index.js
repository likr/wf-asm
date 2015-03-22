function WFModule(stdlib, foreign, heap) {
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
}


function wfAsm(graph) {
  var n = graph.numVertices();
  var size = 1;
  while (size < n * n * 4) {
    size <<= 1;
  }
  var heap = new ArrayBuffer(size);
  var matrix = new Uint32Array(heap, 0, n * n);
  graph.edges().forEach(function(edge) {
    var u = edge[0],
        v = edge[1];
    matrix[u * n + v] = graph.get(u, v).weight;
  });
  module = WFModule(window, null, heap);
  module.warshallFloyd(n);
}


function wfEgridCore(graph) {
  var solver = egrid.core.graph.warshallFloyd();
  solver(graph);
}


function run(f) {
  var i;
  var repeat = 5;
  var start = new Date();
  for (i = 0; i < repeat; ++i) {
    f();
  }
  var stop = new Date();
  return (stop - start) / repeat;
}


(function() {
  var i, u, v;
  var nv = 200;
  var ne = nv * nv / 10;
  var edges = [];

  var graph = egrid.core.graph.adjacencyList();
  for (i = 0; i < nv; ++i) {
    graph.addVertex();
  }
  for (i = 0; i < ne; ++i) {
    u = Math.floor(Math.random() * nv);
    v = Math.floor(Math.random() * nv);
    graph.addEdge(u, v, {
      weight: Math.floor(Math.random() * 9) + 1
    });
  }

  var time1 = run(function() {
    wfAsm(graph);
  });

  var time2 = run(function() {
    wfEgridCore(graph);
  });

  var body = document.getElementsByTagName('body')[0];

  var div1 = document.createElement('div');
  div1.innerHTML = 'asm.js: ' + time1 + 'ms';
  body.appendChild(div1);

  var div2 = document.createElement('div');
  div2.innerHTML = 'egrid-core: ' + time2 + 'ms';
  body.appendChild(div2);

  var div3 = document.createElement('div');
  div3.innerHTML = (time2 / time1) + 'X';
  body.appendChild(div3);
})();
