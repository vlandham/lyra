vde.Vis.marks.Group = (function() {
  var group = function(name) {
    vde.Vis.Mark.call(this, name || 'group_' + (vg.keys(vde.Vis.groups).length+1));

    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.
    this.groupName = this.name;

    this.scales = {};
    this.axes   = {};
    this.marks  = {};

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

    this.properties = {
      x: {value: 0},
      width: {value: vde.Vis.properties.width},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: vde.Vis.properties.height},
      y2: {value: 0, disabled: true},
      fill: {value: '#ffffff'},
      fillOpacity: {value: 0},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    return this.init();
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.init = function() {
    vde.Vis.groups[this.name] = this;

    return vde.Vis.Mark.prototype.init.call(this);
  };

  prototype.update = function(props) {
    vde.Vis.Mark.prototype.update.call(this, props);

    // Because a group could affect sub-marks, re-parse the submarks
    for(var m in this.marks)
      this.marks[m].update(['x', 'x2', 'width', 'y', 'y2', 'height']);   

    return this;
  }

  prototype.spec = function() {
    var self = this;
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));

    vde.Vis.Callback.run('group.pre_spec', this, {spec: spec});

    ['scales', 'axes', 'marks'].forEach(function(t) {
      vg.keys(self[t]).forEach(function(k) {
        var s = self[t][k].spec();
        if(!s) return;
        spec[t].push(s);
      });      
    });

    vde.Vis.Callback.run('group.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.scale = function(mark, spec, defaultSpec, displayName) {
    var scale = mark.pipeline().scale(spec, defaultSpec, displayName);
    this.scales[scale.name] = scale;

    return scale;
  };

  prototype.annotate = function() {
    this._def = null;
    this._items = [];

    for(var m in this.marks) {
      this.marks[m]._def = null;
      this.marks[m]._items = [];

      this.marks[m].def();
    }
  };

  prototype.export = function() {
    // Export w/o circular structure in marks
    if(!this._def && this._items.length == 0) return vg.duplicate(this);
    var marks = this.marks, def = this.def(), items = this.items();

    this.marks = {};
    for(var m in marks) {
      var ex = marks[m].export();
      this.marks[ex.name] = ex;
    }
    this._def = null;
    this._items = [];

    var ex = vg.duplicate(this);
    this.marks = marks;
    this._def = def;
    this._items = items;

    return ex;
  };

  prototype.selected = function() {
    // Since groups are fancy rects
    return vde.Vis.marks.Rect.prototype.selected.call(this);
  };

  prototype.coordinates = function(connector, item, def) {
    return vde.Vis.marks.Rect.prototype.coordinates.call(this, connector, item, def);
  };

  prototype.handles = function(item) { 
    return vde.Vis.marks.Rect.prototype.handles.call(this, item); 
  };

  prototype.spans = function(item, property) {
    return vde.Vis.marks.Rect.prototype.spans.call(this, item, property);
  }

  return group;
})();