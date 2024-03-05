var canvas = null;
var gl = null;
var shaderProgram = null;
var projectionMatrix = null;
var modelViewMatrix = null;
var cameraPosition = null; // Initial camera position
var cameraForward = null; // Initial forward direction
var cameraUp = null;

window.onload = function init() {
    // Get the canvas element and its WebGL2 context
    canvas = document.getElementById('webglCanvas');
    gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('Your browser does not support WebGL2');
    }

    // Vertex shader program
    const vsSource = `#version 300 es
    in vec3 aVertexPosition;
    in vec3 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    out vec3 vColor;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        vColor = aVertexColor;
    }
`;

    // Fragment shader program
    const fsSource = `#version 300 es
    precision highp float;
    in vec3 vColor;
    out vec4 fragColor;

    void main(void) {
        fragColor = vec4(vColor, 1.0);
    }
`;

    // Function to compile a shader from a source string
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Function to link vertex and fragment shaders into a shader program
    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

        // Create the shader program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    // Initialize the shader program
    shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
        alert('Failed to initialize shader program');
    } else {
        // Use the program object
        gl.useProgram(shaderProgram);
    }

    // After this point, you can set up your buffers, vertex attributes, and uniform locations

    // Vertex positions for a cube
    const cubeVertices = [
// Front face
-1.0, -1.0, 1.0,
1.0, -1.0, 1.0,
1.0, 1.0, 1.0,
-1.0, -1.0, 1.0,
1.0, 1.0, 1.0,
-1.0, 1.0, 1.0,

// Back face
-1.0, -1.0, -1.0,
-1.0, 1.0, -1.0,
1.0, 1.0, -1.0,
-1.0, -1.0, -1.0,
1.0, 1.0, -1.0,
1.0, -1.0, -1.0,

// Top face
-1.0, 1.0, -1.0,
-1.0, 1.0, 1.0,
1.0, 1.0, 1.0,
-1.0, 1.0, -1.0,
1.0, 1.0, 1.0,
1.0, 1.0, -1.0,

// Bottom face
-1.0, -1.0, -1.0,
1.0, -1.0, -1.0,
1.0, -1.0, 1.0,
-1.0, -1.0, -1.0,
1.0, -1.0, 1.0,
-1.0, -1.0, 1.0,

// Right face
1.0, -1.0, -1.0,
1.0, 1.0, -1.0,
1.0, 1.0, 1.0,
1.0, -1.0, -1.0,
1.0, 1.0, 1.0,
1.0, -1.0, 1.0,

// Left face
-1.0, -1.0, -1.0,
-1.0, -1.0, 1.0,
-1.0, 1.0, 1.0,
-1.0, -1.0, -1.0,
-1.0, 1.0, 1.0,
-1.0, 1.0, -1.0
    ];

    const cubeColors = [
        // Front face (red)
        1.0, 0.0, 0.0, 1.0, // Bottom left
        1.0, 0.0, 0.0, 1.0, // Bottom right
        1.0, 0.0, 0.0, 1.0, // Top right
        1.0, 0.0, 0.0, 1.0, // Bottom left (repeated for the second triangle)
        1.0, 0.0, 0.0, 1.0, // Top right (repeated for the second triangle)
        1.0, 0.0, 0.0, 1.0, // Top left
    
        // Back face (green)
        0.0, 1.0, 0.0, 1.0, // Bottom left
        0.0, 1.0, 0.0, 1.0, // Top left
        0.0, 1.0, 0.0, 1.0, // Top right
        0.0, 1.0, 0.0, 1.0, // Bottom left (repeated for the second triangle)
        0.0, 1.0, 0.0, 1.0, // Top right (repeated for the second triangle)
        0.0, 1.0, 0.0, 1.0, // Bottom right
    
        // Top face (blue)
        0.0, 0.0, 1.0, 1.0, // Bottom left
        0.0, 0.0, 1.0, 1.0, // Bottom right
        0.0, 0.0, 1.0, 1.0, // Top right
        0.0, 0.0, 1.0, 1.0, // Bottom left (repeated for the second triangle)
        0.0, 0.0, 1.0, 1.0, // Top right (repeated for the second triangle)
        0.0, 0.0, 1.0, 1.0, // Top left
    
        // Bottom face (yellow)
        1.0, 1.0, 0.0, 1.0, // Bottom left
        1.0, 1.0, 0.0, 1.0, // Bottom right
        1.0, 1.0, 0.0, 1.0, // Top right
        1.0, 1.0, 0.0, 1.0, // Bottom left (repeated for the second triangle)
        1.0, 1.0, 0.0, 1.0, // Top right (repeated for the second triangle)
        1.0, 1.0, 0.0, 1.0, // Top left
    
        // Right face (cyan)
        0.0, 1.0, 1.0, 1.0, // Bottom left
        0.0, 1.0, 1.0, 1.0, // Top left
        0.0, 1.0, 1.0, 1.0, // Top right
        0.0, 1.0, 1.0, 1.0, // Bottom left (repeated for the second triangle)
        0.0, 1.0, 1.0, 1.0, // Top right (repeated for the second triangle)
        0.0, 1.0, 1.0, 1.0, // Bottom right
    
        // Left face (magenta)
        1.0, 0.0, 1.0, 1.0, // Bottom left
        1.0, 0.0, 1.0, 1.0, // Bottom right
        1.0, 0.0, 1.0, 1.0, // Top right
        1.0, 0.0, 1.0, 1.0, // Bottom left (repeated for the second triangle)
        1.0, 0.0, 1.0, 1.0, // Top right (repeated for the second triangle)
        1.0, 0.0, 1.0, 1.0, // Top left
    ];

    // Step 4: Create buffers and upload data
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeColors), gl.STATIC_DRAW);

    // Step 5: Configure vertex attributes
    // Assuming you've already linked your shader program and know the attribute locations
    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    const colorAttribLocation = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Continue with matrix setup and rendering loop...
    // Create projection matrix (field of view, aspect ratio, near, and far clipping planes)
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    projectionMatrix = mat4.create(); // Assuming gl-matrix library is used for matrix operations
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Create model-view matrix (move the object back a bit so we can see it)
    modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // Move back in Z

    // Set the shader's uniform for the matrices
    const uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

 cameraPosition = vec3.fromValues(0, 0, 5); // Initial camera position
 cameraForward = vec3.fromValues(0, 0, -1); // Initial forward direction
 cameraUp = vec3.fromValues(0, 1, 0); // Up direction
// Resize the canvas to fit the window initially
resizeCanvas();
render();
};



function updateCameraDirection(angle, axis) {
    let rotationMatrix = mat4.create();
    mat4.rotate(rotationMatrix, rotationMatrix, angle, axis);
    vec3.transformMat4(cameraForward, cameraForward, rotationMatrix);
    vec3.normalize(cameraForward, cameraForward); // Normalize to maintain direction only
}

window.addEventListener('keydown', function(event) {
   
    switch(event.keyCode) {
        case 71: // 'G' key, rotate right
            updateCameraDirection(glMatrix.toRadian(-5), cameraUp); // Rotate around up axis
            break;
        case 69: // 'E' key, rotate left
            updateCameraDirection(glMatrix.toRadian(5), cameraUp); // Rotate around up axis
            break;
        case 40: // up arrow key // 82'R' key, move forward
            vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraForward, -0.1); // Move forward
            break;
        case 38: // down arrow key // 70 'F' key, move backward
            vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraForward, 0.1); // Move backward
            break;
        case 82:  // 'R' key
            vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraUp, 0.1); // Move up
          
            break;
        case 70:  //  'F' key
            vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraUp, -0.1); // Move down
            break;
        case 37: // Left arrow key, strafe left
        {
            let leftVector = vec3.create();
            vec3.cross(leftVector, cameraUp, cameraForward);
            vec3.normalize(leftVector, leftVector);
            vec3.scaleAndAdd(cameraPosition, cameraPosition, leftVector, 0.1); // Strafe left
        }
            break;
        case 39: // Right arrow key, strafe right
        {
            let rightVector = vec3.create();
            vec3.cross(rightVector, cameraForward, cameraUp);
            vec3.normalize(rightVector, rightVector);
            vec3.scaleAndAdd(cameraPosition, cameraPosition, rightVector, 0.1); // Strafe right
        }
            break;
        case 66: // 'T' key, rotate up around right axis
        {
            let rightVector = vec3.create();
            vec3.cross(rightVector, cameraForward, cameraUp);
            vec3.normalize(rightVector, rightVector);
            updateCameraDirection(glMatrix.toRadian(-5), rightVector);
        }
            break;
        case 84: // 'B' key, rotate down around right axis
         {

            let rightVector = vec3.create();
            vec3.cross(rightVector, cameraForward, cameraUp);
            vec3.normalize(rightVector, rightVector);
            updateCameraDirection(glMatrix.toRadian(5), rightVector);
            
         }
            break;
        // Add other controls as needed
    }

    // Update the modelViewMatrix based on the new camera position and orientation
    let lookAt = vec3.create();
    vec3.add(lookAt, cameraPosition, cameraForward); // Calculate where the camera is looking
    mat4.lookAt(modelViewMatrix, cameraPosition, lookAt, cameraUp); // Recreate modelViewMatrix

    render(); // Redraw the scene with the updated modelViewMatrix
});

function resizeCanvas() {
        
    // Subtract any desired margins or borders if necessary
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // If using WebGL or 2D contexts, you may need to adjust the viewport or redraw the scene here
    // For WebGL:
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Redraw your scene
}



// Add an event listener to resize the canvas whenever the window is resized
window.addEventListener('resize', resizeCanvas);

function render() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Bind the shader program
    gl.useProgram(shaderProgram);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        false,
        modelViewMatrix);

    // Draw the cube
    {
        const offset = 0;
        const vertexCount = 36; // 6 faces * 2 triangles/face * 3 vertices/triangle
        gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }

    // For animated scenes, request that the render function be called
    // again on the next frame
    requestAnimationFrame(render);
}

function handleKeyDown(event) {
    const moveSpeed = 0.1;
    const turnSpeed = 10;
    switch(event.keyCode) {
        case 37: // Left arrow key
            // Move camera left or rotate left
            mat4.translate(modelViewMatrix, modelViewMatrix, [moveSpeed, 0.0, 0.0]); // Move scene left

            break;
        case 38: // Up arrow key
            // Move camera up or rotate up
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, moveSpeed]); // Move scene left

            break;
        case 39: // Right arrow key
            // Move camera right or rotate right
            mat4.translate(modelViewMatrix, modelViewMatrix, [-moveSpeed, 0.0, 0.0]); // Move scene left
            break;
        case 40: // Down arrow key
            // Move camera down or rotate down
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -moveSpeed]); // Move scene left

            break;
        case 82:
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, -moveSpeed, 0.0]); // Move scene left

            break;

        case 70:
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, moveSpeed, 0.0]); // Move scene left

            break;
        case 69: // 'E' key
            // Rotate the model-view matrix to the right (e.g., around the Y axis)
            mat4.rotate(modelViewMatrix, modelViewMatrix, glMatrix.toRadian(turnSpeed), [0, 1, 0]);
            break;
        case 71: // 'G' key
            // Rotate the model-view matrix to the left (e.g., around the Y axis)
            mat4.rotate(modelViewMatrix, modelViewMatrix, glMatrix.toRadian(-turnSpeed), [0, 1, 0]);
            break;
    }
}

// Function to compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Function to initialize shaders
function initShaders(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

