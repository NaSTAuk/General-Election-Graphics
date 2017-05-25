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

## Data Files 
### live-seats.json - LIVE

Key  | Value Description | Example
------------- | ------------- | -------------
Party_Code    | Party Acronym | LAB
Party_Name    | Full Name of party | Conservative
Live_Seats    | Number of current seats | 70
Exit_Poll     | Number of seats in exit poll | 90
Live_Change   | Number of current seats that have been won - lost | 10
PreElection_Seats | Number of seats prior to the election | 229
PreElection_Percent | Percentage of votes in 2015 | 7.9%
Color | HEX color for party | #FEAE14

### 2017_candidates.json - LIVE

Key  | Value Description | Example
------------- | ------------- | -------------
id    | Candidate unique ID | 5570
name    | Candidate Name | Caroline Jones
party_id    | party_id used by various databases | party:85
party_name    | Full name of party | UK Independence Party (UKIP) 
constituency   | Consituency name | Aberavon
image_url | png image. Not all candidates have images | https://candidates.democracyclub.org.uk/media/images/images/5570.png
gss_code | Standard code for constituency | W07000049
color | HEX color for party | #70147a
votes | number of votes that candidate received | 10

### data_dump.json - Not Live

Not all keys are presented

Key  | Value Description | Example
------------- | ------------- | -------------
Const_ID    | Standard code for constituency | W07000049
Const_Name    | Constituency Name | Aldershot
Result    | Number of current seats | Con Hold
Winner    | 2015 winning party | Con
VALID15   |Number of votes in 2015 | 60000
MAJ | 2015 Majority | 20000
Turnout15 | Percent turnout in 2015 | 63.8
Elect15 | size of electorate in 2015 | 72434
DateTime | Announcement time in 2015 | 08/05/2015 04:39:00
EUHANLEAVE | Proportion of leave votes | 0.578978 
EUHANREM | Proportion of remain votes | 0.421022
Color | HEX color for party | #0575c9
