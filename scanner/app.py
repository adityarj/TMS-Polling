import sys;
import requests;

baseUrl = "http://localhost:8080/api/voter/authenticate/otp";

while 1:
    print "Please scan an IC";
    line = sys.stdin.readline().rstrip()[:-9];
    print "Scanned successfully. The ID is", line;
    r = requests.post(baseUrl, data={"nric": line.lower()});
    if r.status_code == 200:
        print "Successfully requested for OTP"
    elif r.status_code == 403:
        print r.text;
    elif r.status_code == 500:
        print "Server Error! Try again later";
    
