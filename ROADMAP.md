# ROADMAP

[X] Create cloudant database and connect server
[X] Get API working (take out auth)
[X] Fix linting
[X] Get angular up (fix modules not being rendered)
[X] Get people endpoint working
[X] Skills
[] Hook up edit projects view
[] Make utilizations database and users database congruent
[] Vacations view

## Eventually

[] Fix utilization hours calculations
[] Add projects and more people
[] Add more visualization with D3.js


# NOTES

All app routes have been made public in this version
- changed "requiredLogin: true" to "requiredLogin: false", fix to required login true for everything besides login route

Disabled JWT usage
 - Overide token in project service


Look at line 1218