function WFModule(stdlib, foreign, heap) {
  "use asm";

  var buffer = new stdlib.Uint32Array(heap);
  var imul = stdlib.Math.imul;

  function fill(nv, offset) {
    nv = nv | 0;
    offset = offset | 0;

    var i = 0,
        n = 0;

    n = offset + (imul(nv, nv) | 0) << 2 | 0;
    for (i = offset << 2; (i | 0) < (n | 0); i = i + 4 | 0) {
      buffer[i >> 2] = 0x00ffffff;
    }
  }

  function main(nv, offset) {
    nv = nv | 0;
    offset = offset | 0;

    var i = 0,
        j = 0,
        k = 0,
        index1 = 0,
        index2 = 0,
        index3 = 0,
        l1 = 0,
        l2 = 0,
        l3 = 0;

    for (i = 0; (i | 0) < (nv | 0); i = (i + 1) | 0) {
      for (j = 0; (j | 0) < (nv | 0); j = (j + 1) | 0) {
        index1 = offset + (imul(i, nv) | 0) + j | 0;
        l1 = buffer[index1 << 2 >> 2] | 0;
        for (k = 0; (k | 0) < (nv | 0); k = (k + 1) | 0) {
          index2 = offset + (imul(i, nv) | 0) + k | 0;
          index3 = offset + (imul(k, nv) | 0) + j | 0;
          l2 = buffer[index2 << 2 >> 2] | 0;
          l3 = buffer[index3 << 2 >> 2] | 0;
          if ((l2 + l3 | 0) < (l1 | 0)) {
            buffer[index1 << 2 >> 2] = l2 + l3 | 0;
          }
        }
      }
    }
  }

  function warshallFloyd(nv, ne) {
    nv = nv | 0;
    ne = ne | 0;

    var i = 0,
        l = 0,
        u = 0,
        v = 0,
        index = 0,
        offset = 0,
        stop = 0;
    offset = ne * 3 | 0;

    fill(nv, offset);

    for (i = 0; (i | 0) < (ne | 0); i = (i + 1) | 0) {
      index = imul(i, 3) | 0;
      u = buffer[index << 2 >> 2] | 0;
      v = buffer[index + 1 << 2 >> 2] | 0;
      l = buffer[index + 2 << 2 >> 2] | 0;
      index = offset + (imul(v, nv) | 0) + u  | 0;
      buffer[index << 2 >> 2] = l;
    }

    main(nv, offset);
  }

  return {
    warshallFloyd: warshallFloyd
  };
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
  var i, j;
  var nv = 100;
  var ne = nv * nv / 10;

  //var heap = new ArrayBuffer(ne * 12 + nv * nv * 4);
  var heap = new ArrayBuffer(0x200000);
  var edges = new Uint32Array(heap, 0, ne * 3);
  var result = new Uint32Array(heap, ne * 12, nv * nv);

  for (i = 0; i < ne; ++i) {
    edges[i * 3] = Math.floor(Math.random() * nv);
    edges[i * 3 + 1] = Math.floor(Math.random() * nv);
    edges[i * 3 + 2] = Math.floor(Math.random() * 9) + 1;
  }

  module = WFModule(window, null, heap);
  var time1 = run(function() {
    module.warshallFloyd(nv, ne);
  });

  var graph = egrid.core.graph.adjacencyList();
  for (i = 0; i < nv; ++i) {
    graph.addVertex();
  }
  for (i = 0; i < ne; ++i) {
    graph.addEdge(edges[i * 3], edges[i * 3 + 1], {
      weight: edges[i * 3 + 2]
    });
  }
  var solver = egrid.core.graph.warshallFloyd();
  var time2 = run(function() {
    solver(graph);
  });

  (function() {
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

    // var table = document.createElement('table');
    // for (var i = 0; i < nv; ++i) {
    //   var tr = document.createElement('tr');
    //   for (var j = 0; j < nv; ++j) {
    //     var td = document.createElement('td');
    //     td.innerHTML = result[i * nv + j] == 0x00ffffff ? '-' : result[i * nv + j];
    //     td.setAttribute('width', '40');
    //     td.setAttribute('style', 'text-align: right');
    //     tr.appendChild(td);
    //   }
    //   table.appendChild(tr);
    // }
    // body.appendChild(table);
  })();
})();
