# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from datetime import datetime, timezone, timedelta
from firebase_admin import initialize_app, firestore, initialize_app
from flask import Flask
from firebase_functions import scheduler_fn
from functionsConfig import cred

flaskApp = Flask(__name__)

app = initialize_app(cred)
client = firestore.client()

####################
#FIREBASE FUNCTIONS#
####################

@scheduler_fn.on_schedule(schedule="50 14 * * *")
def pruneMenus(event: scheduler_fn.ScheduledEvent) -> None:
   #Menu clearing (all but 4 newest)
   menu_col = client.collection("menus")
   menu_ref = client.collection("menus").stream()

   result = menu_col.count()
   count = result.get()[0][0].value

   if(count!=4):
      for doc in menu_ref:
         realDoc = menu_col.document(doc.id)
         if count>4:
            realDoc.delete()
         count = count-1
   
   #Meal Cleaning (Older than 3 days)
   timezone_offset = -4.0  # Eastern Daylight Time (UTC−04:00)
   tzinfo = timezone(timedelta(hours=timezone_offset))
   current_time = datetime.now(tzinfo).timestamp()

   meal_col = client.collection("meals")
   meal_ref = client.collection("meals").stream()

   for doc in meal_ref:
      if(int(doc.id)<(current_time*1000 - 259200000)):
         realMealDoc = meal_col.document(doc.id)
         realMealDoc.delete()
         print("Deleted: ", doc.id)

@scheduler_fn.on_schedule(schedule="0 4 * * *")
def clearStreaks(event: scheduler_fn.ScheduledEvent) -> None:
   timezone_offset = -4.0  # Eastern Daylight Time (UTC−04:00)
   tzinfo = timezone(timedelta(hours=timezone_offset))
   current_time = datetime.now(tzinfo).timestamp()

   usersCol = client.collection("users")
   usersRef = client.collection("users").stream()

   for doc in usersRef:
      timeDif = current_time*1000 - doc.to_dict()["streakCheckIn"]
      print(timeDif)
      if(timeDif > 86400000):
         usersCol.document(doc.id).update({"streak": 0})
         usersCol.document(doc.id).update({"streakCheckIn": 0})


@scheduler_fn.on_schedule(schedule="0,30 0,10-13,15-18,20-23 * * *")
def updateHallBusyness(event: scheduler_fn.ScheduledEvent) -> None:
   timezone_offset = -4.0  # Eastern Daylight Time (UTC−04:00)
   tzinfo = timezone(timedelta(hours=timezone_offset))

   current_time = datetime.now(tzinfo).timestamp() #Seconds since epoch
   timeHour = datetime.now(tzinfo).hour
   timeFrame = ""

   if (timeHour%2) == 0:
      timeFrame = f"{timeHour-1}-{timeHour}"
   else:
      timeFrame = f"{timeHour}-{timeHour+1}"

   hicksH_ref = client.collection("functionStorage").document("HicksHistory")
   hicksCheckIn = 0

   mapH_ref = client.collection("functionStorage").document("MAPHistory")
   mapCheckIn = 0

   cfaH_ref = client.collection("functionStorage").document("CFAHistory")
   cfaCheckIn = 0

   users_ref = client.collection("users").stream()
   user_col = client.collection("users")

   for doc in users_ref:
     realDoc = user_col.document(doc.id)

     checkTime = doc.to_dict()["checkInTime"] / 1000
     if (current_time-checkTime)>2700:
        realDoc.update({"checkInTime": int(0)})
        realDoc.update({"currentLocation": "None"})
     else:
       location = doc.to_dict()["currentLocation"]

       if location == "Hicks Dining Hall":
         hicksCheckIn += 1
       elif location == "MAP Dining Hall":
         mapCheckIn += 1
       else:
         cfaCheckIn += 1

   hicksProjection = checkInBusyness(hicksCheckIn)
   mapProjection = checkInBusyness(mapCheckIn)
   cfaProjection = checkInBusyness(cfaCheckIn)

   hicksStream = client.collection("busyness").document("Hicks").collection("ratings").stream()
   hicksCollection = client.collection("busyness").document("Hicks").collection("ratings")
   mapStream = client.collection("busyness").document("MAP").collection("ratings").stream()
   mapCollection = client.collection("busyness").document("MAP").collection("ratings")
   cfaStream = client.collection("busyness").document("CFA").collection("ratings").stream()
   cfaCollection = client.collection("busyness").document("CFA").collection("ratings")

   hicksReport = createProjection(hicksStream, current_time, hicksProjection, hicksH_ref, timeFrame, hicksCollection)
   mapReport = createProjection(mapStream, current_time, mapProjection, mapH_ref, timeFrame, mapCollection)
   cfaReport = createProjection(cfaStream, current_time, cfaProjection, cfaH_ref, timeFrame, cfaCollection)
    
   hicksH_ref.update({timeFrame: hicksReport})
   client.collection("busyness").document("Hicks").update({"busyness": hicksReport})

   mapH_ref.update({timeFrame: mapReport})
   client.collection("busyness").document("MAP").update({"busyness": mapReport})

   cfaH_ref.update({timeFrame: cfaReport})
   client.collection("busyness").document("CFA").update({"busyness": cfaReport})

def checkInBusyness(hallVisitors):
   if hallVisitors > 30:
      return 15
   elif hallVisitors > 20:
      return 10
   elif hallVisitors > 10:
      return 5
   else:
      return 0
   
def createProjection(hallStream, current_time, hallProjection, hallHistory_ref, timeFrame, hallCollection):
  reportedTime = 0
  counter = 0

  for doc in hallStream:
      checkTime = ((doc.to_dict()["timestamp"]))/1000

      if (current_time-checkTime)>2700:
        realDoc = hallCollection.document(doc.id)
        realDoc.delete()
      else:
        reportedTime += doc.to_dict()["waitTime"]
        counter+=1

  if counter != 0:
    reportedTime = reportedTime/counter
  else:
     histRef = hallHistory_ref.get()
     reportedTime = histRef.to_dict()[timeFrame]

  if reportedTime>hallProjection:
     return reportedTime
  else:
     return hallProjection