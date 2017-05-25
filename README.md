# NaSTA General Election 2017 Graphics

It has been suggested that for the General Election 2017 NaSTA should build a graphics package based on the LA1:TV / YSTV Roses Graphics as used throughout their jointed Roses broadcasts.

## CasparCG Versions
Server version: 2.1.0 beta 2
Client version: 2.0.8

## Launching Graphics

### Windows
Double click
```
./startup.bat
```

For the [admin](http://127.0.0.1:3000/admin) page, navigate to http://127.0.0.1:3000/admin

For the [graphics](http://127.0.0.1:3000) output, navigate to http://127.0.0.1:3000

### Linux / Mac
Run from the directory this readme is in:
```
npm install
node server.js
```

For the [admin](http://127.0.0.1:3000/admin) page, navigate to http://127.0.0.1:3000/admin

For the [graphics](http://127.0.0.1:3000) output, navigate to http://127.0.0.1:3000

## Live Data
live-seats.json

Key  | Value Description
------------- | -------------
Party_Code    | Party Acronym: LAB, CON, LD etc.
Party_Name    | Full Name of party: Conservative
Live_Seats    | Number of current seats: 70
Exit_Poll     | Number of seats in exit poll: 90
Live_Change   | Number of current seats that have been won / lost
PreElection_Seats | Number of seats prior to the election
PreElection_Percent | Percentage of votes in 2015
Color | HEX color for party
