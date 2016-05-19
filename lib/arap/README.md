# ARAP.js

[As Rigid As Possible Shape Deformation](http://www.igl.ethz.ch/projects/ARAP/arap_web.pdf) for the browser.

![Scene example](example.gif)

Currently in development. This will eventually be a standalone repo.

### How to build

* Install [emscripten][1]
* Run `emcc-deform2d.sh`, this will generate `deform2d.js` and `deform2d.html`
* Make sure everything is working by opening `deform2d.html`. You should see the message telling you everyghin built correctly.

### How to use

* Include `arap.js` and `deform2d.js` in your project

[1]: https://github.com/kripken/emscripten
[2]: http://www.dgp.toronto.edu/~rms/software/Deform2D/
[3]: https://www.youtube.com/watch?v=Ls1YAKmUPIw