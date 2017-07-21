// Declare_Any_Class("Node",
// {
// 	'construct': function(source) {
// 		this.children = [];
// 		this.localMatrix = mat4();
// 		this.worldMatrix = mat4();
// 		this.source = source;
// 	},
// 	'setParent': function(parent) {
// 		// remove us from our parent
// 		if (this.parent) {
// 			var ndx = this.parent.children.indexOf(this);
// 			if (ndx >= 0) {
// 				this.parent.children.splice(ndx, 1);
// 			}
// 		}

// 		// Add us to our new parent
// 		if (parent) {
// 			parent.children.push(this);
// 		}
// 		this.parent = parent;
// 	},
// 	'updateWorldMatrix': function(parentWorldMatrix) {
// 		var source = this.source;
// 		if (source) {
// 			console.log('local - pre');
// 			console.log(this.localMatrix);
// 			this.localMatrix = source.getMatrix(this.localMatrix);
// 			console.log('source');
// 			console.log(this.source.translation);
// 			console.log('local');
// 			console.log(this.localMatrix);
// 		}

// 		if (parentWorldMatrix) {
// 			// a matrix was passed in so do the math
// 			this.worldMatrix = mult(parentWorldMatrix, this.localMatrix);
// 		} else {
// 			// no matrix was passed in so just copy local to world
// 			this.worldMatrix = this.localMatrix;
// 		}

// 		// now process all the children
// 		var worldMatrix = this.worldMatrix;
// 		this.children.forEach(function(child) {
// 			child.updateWorldMatrix(worldMatrix);
// 		});
// 	}
// } );

// Declare_Any_Class("TRS",
// {
// 	'construct': function() {
// 		this.translation = [0, 0, 0];
// 		this.rotation = [0, 0, 0];
// 		this.scale = [1, 1, 1];
// 	},
// 	'getMatrix': function(dste) {
// 		var dst = dste || new Float32Array(16);
// 		console.log("dst");
// 		console.log(dst);
// 		var t = this.translation;
// 		var r = this.rotation;
// 		var s = this.scale;
// 		dst = mult(dst, translation(t[0], t[1], t[2]));
// 		dst = mult(dst, rotation(r[0], [1, 0, 0]));
// 		dst = mult(dst, rotation(r[1], [0, 1, 0]));
// 		dst = mult(dst, rotation(r[2], [0, 0, 1]));
// 		dst = mult(dst, scale(s[0], s[1], s[2]));
// 		return dst;
// 	}
// } );


var TRS = function() {
	this.translation = [0, 0, 0];
	this.rotation = [0, 0, 0];
	this.scale = [1, 1, 1];
};

TRS.prototype.getMatrix = function(dst) {
	dst = dst || mat4();
	var t = this.translation;
	var r = this.rotation;
	var s = this.scale;
	// console.log(this.translation);
	// console.log(translation(t[0], t[1], t[2]));
	// console.log("pre dst");
	// console.log(dst);
	dst = translation(t[0], t[1], t[2]);
	dst = mult(dst, rotation(r[0], [1, 0, 0]));
	dst = mult(dst, rotation(r[1], [0, 1, 0]));
	dst = mult(dst, rotation(r[2], [0, 0, 1]));
	dst = mult(dst, scale(s[0], s[1], s[2]));
	// console.log("dst");
	// console.log(dst);
	return dst;
};

var Node = function(source) {
	this.children = [];
	this.localMatrix = mat4();
	this.worldMatrix = mat4();
	this.source = source;
};

Node.prototype.setParent = function(parent) {
	// remove us from our parent
	if (this.parent) {
		var ndx = this.parent.children.indexOf(this);
		if (ndx >= 0) {
			this.parent.children.splice(ndx, 1);
		}
	}

	// Add us to our new parent
	if (parent) {
		parent.children.push(this);
	}
	this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(parentWorldMatrix, localMatrix) {

	var source = this.source;
	if(localMatrix) {
		this.localMatrix = localMatrix;
	} else if (source) { //console.log("source"); console.log(source);
		// console.log("local - pre update"); console.log(this.localMatrix);
		this.localMatrix = source.getMatrix(this.localMatrix);
		// console.log("local - after update"); console.log(this.localMatrix);
	}

	if (parentWorldMatrix) {
		// a matrix was passed in so do the math

		// reset parent scaling, so object is only scaled locally
		// var pMat = copy(parentWorldMatrix);
		// pMat[0][0] = 1;
		// pMat[1][1] = 1;
		// pMat[2][2] = 1;

		// this.worldMatrix = mult(pMat, this.localMatrix);

		var parentMatrix = parentWorldMatrix;

		//invert parent scale
		if(!this.adoptParentScale) {
			var parentScale = this.parent.source.scale;
			parentMatrix = mult(parentWorldMatrix, scale(1/parentScale[0], 1/parentScale[1], 1/parentScale[2]));
		}

		this.worldMatrix = mult(parentMatrix, this.localMatrix);
	} else {
		// no matrix was passed in so just copy local to world
		this.worldMatrix = copy(this.localMatrix);
	}

	if(this === nodeInfosByName["torso"].node) {
		var theta = ((degrees(-Math.asin(this.worldMatrix[2][0]))));
		// console.log('worldmat');
		// console.log(this.worldMatrix);
		// console.log('worldmat 2,0');
		// console.log(this.worldMatrix[2][0]);
		// console.log("updateWorldMatrix theta: " + theta);
		// console.log('rot');
		// console.log(this.source.rotation);
	}

	// now process all the children
	var worldMatrix = this.worldMatrix;
	this.children.forEach(function(child) {
		child.updateWorldMatrix(worldMatrix, null, true);
	});
};