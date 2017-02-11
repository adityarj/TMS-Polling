import sys;
import requests;
import getpass;
import json;

# baseUrl = "http://localhost:8080/api/";
baseUrl = "https://tms-polling.herokuapp.com/api/";

logged_in = False;
event_id = False;

while logged_in == False:
    username = raw_input("email: ");
    password = getpass.getpass("password: ");
    r = requests.post(baseUrl + "organiser/authenticate/login", data={"username": username, "password": password});
    if r.status_code == 200:
        token = json.loads(r.text)["token"]
        logged_in=True
    else:
        print "Login attempt failed"
        
while event_id == False:
    r = requests.get(baseUrl + "organiser/event/current?token=" + token);
    if r.status_code == 200:
        data = json.loads(r.text)
        if len(data) == 0:
            print "There is no current event going on!"
            sys.exit()
        for event in data:
            print str(event["id"]) + ". " + str(event["name"]);
        event_id = raw_input("Choose Event based on id: ");

while 1:
    print "Please scan an IC";
    line = sys.stdin.readline().rstrip()[:-9];
    print "Scanned successfully. The ID is", line;
    r = requests.post(baseUrl + "voter/authenticate/otp", data={"nric": line, "eventId": event_id});
    if r.status_code == 200:
        print "Successfully requested for OTP"
    elif r.status_code == 403:
        print r.text;
    elif r.status_code == 500:
        print "Server Error! Try again later";
    
