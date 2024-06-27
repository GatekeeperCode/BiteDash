# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import time
import requests
from bs4 import BeautifulSoup, Comment
import datetime

import firebase_admin
from firebase_admin import auth
from firebase_admin import firestore
from firebase_functions import scheduler_fn
from firebaseCred import cred

firebase_admin.initialize_app(cred)
db = firestore.client()

client = firestore.client()

hicks_stations = ["Spoon & Fork", "V2", "Grill", "Bravo", "Pizza & Pasta", "Carvery", "Inspired Eats"]
map_stations = ["Daily Dish","Inspired Eats","West Select" ,"Hello Bistro", "Bowls", "Wolf Creek Deli"]

def visibleTag(element):
    #filter out nonvisible text from the site 
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    #find any xml/html visible text
    if isinstance(element, Comment):
        return False
    return True


def text_from_html(page):
    soup = BeautifulSoup(page, "html.parser")
    texts = soup.findAll(string=True)
    visible_texts = filter(visibleTag, texts)  
    return u"-".join(t.strip() for t in visible_texts)

def appendWeekToUrl(url):
    weekNumbers = [("3/11/2024","wk2-"),("3/18/2024","wk3-"),
                ("3/25/2024", "wk4-"),("4/1/2024","wk5-"),
                ("4/8/2024","wk1-"),("4/15/2024","wk2-"),
                ("4/22/2024","wk3-"),("4/29/2024","wk4-"),
                ("5/6/2024","wk5-"),("5/13/2024","wk1-")]
    currentTime = datetime.datetime.now()
    currentWeek = ""
     
    for week in weekNumbers:
        weekDate = datetime.datetime.strptime(week[0], "%m/%d/%Y")
        if weekDate <= currentTime < weekDate + datetime.timedelta(days=7):
            currentWeek = week[1]
            break
    print(currentWeek)
    if not currentWeek:
        print("Current date is not within the provided weeks.")
        return
    
    dotw = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for i in range(len(dotw)) :
        dotw[i] = url + currentWeek + dotw[i]
        
        
    for i in range(len(dotw)):
        if(i == currentTime.isoweekday() ):
            return dotw[i-1]
            
    
def creatMenuItem(name):
    meal_id = str(int(time.time() * 1000))
    meal_ref = db.collection("meals").document(meal_id)
    meal_data = {"mealName": name , "ratings" : [], "ratingsV2": [], "rating": 0, "up": 0, "down": 0}
    meal_ref.set(meal_data)
    return meal_id
    

def menuSetup(mealTime, diningHallName, mealsAndStations):

    menu_id = str(int(time.time() * 1000))
    menu_ref = db.collection("menus").document(menu_id)
    menu_data = {"timestamp" : menu_id, "mealTime": mealTime , 
                 "diningHallName": diningHallName, "stations" : []}
    currentStation = None 
    if diningHallName == "HICKS":
        sortedStations = {station: [] for station in hicks_stations}
        for item in mealsAndStations:
            if item in hicks_stations:
                currentStation = item
            elif currentStation is not None:
                sortedStations[currentStation].append(creatMenuItem(item))
    else:
        sortedStations = {station: [] for station in map_stations}
        for item in mealsAndStations:
            if item in map_stations:
                currentStation = item
            elif currentStation is not None:
                sortedStations[currentStation].append(creatMenuItem(item))
    menu_data["stations"] = sortedStations
    menu_ref.set(menu_data)


def runScrape():
    URLToday =  appendWeekToUrl("https://grovecitydining.my.canva.site/")
    print(URLToday)
    currentDay = URLToday.split("-")[1]
    page = requests.get(URLToday).content 
    contentArray = text_from_html(page).split("-")
    contentArray.remove("")
    contentArray.remove("Daily Menu")
    contentArray.remove(currentDay)
    print(currentDay)
    #This used to be a triple for loop (technically quad due to some nesting)
    #Looks like a fourth grader wrote this but I promise its better than before 
    #Breaking up the data struct was the only way to keep my sanity
    
    dinnerIndex = contentArray.index("Dinner")
    lunchArray = contentArray[:dinnerIndex]
    lunchArray.remove("Lunch")
    lunchArray.remove("HICKS")
    hicksLunchIndex = lunchArray.index("MAP")
    
    #Station only lunch array HICKS
    hicksLunchArray = lunchArray[:hicksLunchIndex]
    menuSetup("Lunch", "HICKS", hicksLunchArray)
    
    #Station only lunch array MAP 
    mapLunchArray = lunchArray[hicksLunchIndex+1:]
    if currentDay != "saturday" and currentDay != "sunday": 
        menuSetup("Lunch", "MAP", mapLunchArray)
    
    dinnerArray = contentArray[dinnerIndex+1:]    
    dinnerArray.remove("HICKS")
    hicksDinnerIndex = dinnerArray.index("MAP")
    
    
    #Station only dinner array HICKS
    hicksDinnerArray = dinnerArray[:hicksDinnerIndex]
    menuSetup("Dinner", "HICKS", hicksDinnerArray)
    
    #Station only dinner array MAP 
    mapDinnerArray = dinnerArray[hicksDinnerIndex+1:]
    
    if currentDay != "saturday" and currentDay != "sunday": 
        menuSetup("Dinner", "MAP", mapDinnerArray)
        
######################MAIN#######################

@scheduler_fn.on_schedule(schedule="45 14 * * *")
def runTheMenuScrape(event: scheduler_fn.ScheduledEvent) -> None:
    runScrape()
