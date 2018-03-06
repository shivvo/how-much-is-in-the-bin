/**
 * Create a WebGL for a canvas
 */
function initializeWebGL(canvasName) {
  var canvas = $("#" + canvasName);
  var gl = null;
  
  // Safely get the WebGL
  try {
    gl = canvas[0].getContext("experimental-webgl");
    if (!gl) {
    gl = canvas[0].getContext("webgl");
    }
  } catch (error) {
  }

  // No WebGL? Muy problemo
  if (!gl) {
    var errorMessage = "Could not get the WebGL for " + canvasName;
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  return gl;
}

/**
 * Load some WebGL shaders from disk into some HTML script elements before running a WebGL program
 */
function loadShaders(fileIdPairs, callback) {
  var iterator = function (i, fileIdPairs, callback) {
    if (i == fileIdPairs.length) {
      callback();
    } else {
      var file = fileIdPairs[i][0];
      var id = fileIdPairs[i][1];
      $.get(file, function (data) {
        $(id).text(data);
        iterator(i+1, fileIdPairs, callback);
      });
    }
  }
  return iterator(0, fileIdPairs, callback);
}

/**
 * Create a shader program where the source is in an HTML script element 
 */
function createShader(gl, shaderScriptId) {
  // Get the shader source.
  var shaderScript = $("#" + shaderScriptId);
  var shaderSource = shaderScript[0].text;

  // Confirm the type of the shader you want to create.
  var shaderType = null;
  if (shaderScript[0].type == "x-shader/x-vertex") {
  shaderType = gl.VERTEX_SHADER;
  } else if (shaderScript[0].type == "x-shader/x-fragment") {
    shaderType = gl.FRAGMENT_SHADER;
  } else {
    throw new Error("Invalid shader type: " + shaderScript[0].type)
  }

  // Create the shader.
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  // Step 6: Check for errors.
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var infoLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("An error occurred compiling the shader " + shaderScriptId + shaderSource  +  ": " + infoLog);
  } else {

    return shader;
  }
}

/** 
 * Create a GLSL program with two shaders (source specified by HTML script element ID)
 */
function createGlslProgram(gl, vertexShaderId, fragmentShaderId) {  
  // Create a program object.
  var program = gl.createProgram();

  // Attach the shaders.
  gl.attachShader(program, createShader(gl, vertexShaderId));
  gl.attachShader(program, createShader(gl, fragmentShaderId));

  // Link and validate the program.
  gl.linkProgram(program);
  gl.validateProgram(program);

  // Check for errors.
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var infoLog = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("An error occurred linking the program: " + infoLog);
  } else {
    return program;
  }
}

/**
 * Place attribute and uniform locations on WebGL program
 */
function addAttribsUniformsToProgram(gl, program) {
  // Add attribute locations to program
  var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < attribCount; i++) {
    var attrib = gl.getActiveAttrib(program, i);
    program[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }

  // Add uniform locations to program
  var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < uniformCount; i++) {
      var uniform = gl.getActiveUniform(program, i);
      program[uniform.name.split("[")[0]] = gl.getUniformLocation(program, uniform.name);
  }
}

/**
 * Create a WebGL vertex buffer with vertex data 
 */
function createVertexBuffer(gl, vertexData) {
  var vertexArray = new Float32Array(vertexData);
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vertexBuffer;
}

/**
 * Create a WebGL index buffer with index data 
 */
function createIndexBuffer(gl, indexData) {
  var indexArray = new Uint16Array(indexData);
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return indexBuffer;
}

/**
 * Creates a WebGL texture, fills it with vec3 data (treating it as a 1D array) 
 */
function create1DVec3Texture(gl, data) {
  var dataArray = new Float32Array(data);
  var ext = gl.getExtension('OES_texture_float');

  var texture = gl.createTexture();    
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, data.length / 3, 1, 0, gl.RGB, gl.FLOAT, dataArray);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return texture;
}

/**
 * Get WebGL texture unit for texture number
 */
function textureUnitForNumber(gl, textureNumber) {
  return gl["TEXTURE" + textureNumber];
}

/**
 * Bind a WebGL texture to a texture unit and attribute
 */
function bindTextureToUnitAttribute(gl, program, location, texture, textureNumber) {
  gl.activeTexture(textureUnitForNumber(gl, textureNumber));
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // STEP 3: Set texture parameters. These lines are important, but don't worry about what they do for now.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.uniform1i(program[location], textureNumber);
}

var SWGL = {
  initializeWebGL: initializeWebGL,
  loadShaders: loadShaders,
  createShader: createShader,
  createGlslProgram: createGlslProgram,
  addAttribsUniformsToProgram: addAttribsUniformsToProgram,
  createVertexBuffer: createVertexBuffer,
  createIndexBuffer: createIndexBuffer,
  create1DVec3Texture: create1DVec3Texture,
  textureUnitForNumber: textureUnitForNumber,
  bindTextureToUnitAttribute: bindTextureToUnitAttribute
}
