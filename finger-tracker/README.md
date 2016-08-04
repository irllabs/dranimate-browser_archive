Instructions: 

Using WebCam Settings (from the apple app store) and an external webcam turn off all of the auto settings.

Set up camera in a stable position, press "Capture Background" with only the background in the frame. Now you can put your hand in front of the camera.

Features:
- background subtraction (with updating background model)
- color and intensity identification for forground (hand)
- get contour/ convexivity defects very well
- get hull points reasonably well when hand is in forward facing position

Problems:
- only good at identifying fingers when the hand is in a forward facing palm-towards-camera angle (not when fingers intersect with palm from camera's pov).**

To do:
- use colored tape on fingertips + color mask and color tracking in order to make fingertip tracking robust even when hand is not in correct position.


** Looking at [this image](http://eaglesky.github.io/images/posts/hand-gesture/s3.jpg) we see that gestures can be identified given certain patterns of where convexivity defects/hull points are relative to the bounding box/palm etc are... but the webcam cannot identify the exact position of all the fingertips.
