#!/usr/bin/env python3
"""
AI-Driven Predictive Campus Maintenance & Facility Management System
Module: AI / ML Model Training for Complaint Categorization
Affiliation: Jagan Institute of Management Studies (JIMS), Rohini, Sector-5, Delhi
MCA Semester 3 Project
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Comprehensive domain training dataset of campus maintenance complaints
BASE_DATA = [
    # Electrical & Power
    ("light flickering continuously in room", "Electrical & Power"),
    ("switchboard has burnt smell and spark visible", "Electrical & Power"),
    ("power socket not supplying electricity in computer lab", "Electrical & Power"),
    ("tube light tube is blown and humming loudly", "Electrical & Power"),
    ("main mcb trip switch in corridor keeps falling", "Electrical & Power"),
    ("exposed wire hanging near staircase switch", "Electrical & Power"),
    ("ceiling fan rotating very slowly with burning coil smell", "Electrical & Power"),
    ("lab ups backup not charging and beeping intermittently", "Electrical & Power"),
    ("short circuit near the water cooler electric connection", "Electrical & Power"),
    ("emergency backup generator power fluctuating in server room", "Electrical & Power"),
    ("wall outlet broken with loose electrical contact pins", "Electrical & Power"),
    ("flickering halogen lamp in the auditorium stage area", "Electrical & Power"),
    ("electric shock sensation when touching water dispenser tap", "Electrical & Power"),
    ("power trip in seminar hall right during presentation", "Electrical & Power"),
    ("power surge damaged power supply unit in faculty room", "Electrical & Power"),
    ("cables sparking inside distribution box on 1st floor", "Electrical & Power"),
    ("lights not turning on switch board button stuck", "Electrical & Power"),
    ("voltage drop causing computers to restart randomly", "Electrical & Power"),
    ("loose neutral wire creating sparks in control panel", "Electrical & Power"),
    ("exhaust fan motor burnt out and smoking", "Electrical & Power"),
    ("electrical conduit pipe cracked wire insulation exposed", "Electrical & Power"),

    # Plumbing & Water Supply
    ("water leaking heavily from washroom sink pipe on floor", "Plumbing & Water Supply"),
    ("continuous water tap dripping in boys washroom block", "Plumbing & Water Supply"),
    ("toilet flush cistern tank overflowing with dirty water", "Plumbing & Water Supply"),
    ("drainage pipe clogged causing dirty water backlog in sink", "Plumbing & Water Supply"),
    ("water purifier filter leaking water creating a floor puddle", "Plumbing & Water Supply"),
    ("main supply pipe burst outside ground floor cafeteria", "Plumbing & Water Supply"),
    ("no water pressure in third floor faculty restroom", "Plumbing & Water Supply"),
    ("washroom tap handle broken and spraying water on walls", "Plumbing & Water Supply"),
    ("sewer drain bad smell and stagnant water accumulation", "Plumbing & Water Supply"),
    ("drinking water fountain cooler pipe leaking heavily", "Plumbing & Water Supply"),
    ("urinal auto flush valve stuck and wasting water", "Plumbing & Water Supply"),
    ("water seepage from upper floor bathroom ceiling visible", "Plumbing & Water Supply"),
    ("overhead water tank float valve failed water overflowing", "Plumbing & Water Supply"),
    ("restroom commode choked water not flushing down", "Plumbing & Water Supply"),
    ("pipeline joint leaking under washbasin cabinet", "Plumbing & Water Supply"),
    ("water puddle forming in corridor due to pipe leak", "Plumbing & Water Supply"),
    ("ro water filter dispensing muddy yellowish water", "Plumbing & Water Supply"),
    ("drain cover displaced water clogging bathroom floor", "Plumbing & Water Supply"),
    ("washbasin cracked water trickling onto tiles", "Plumbing & Water Supply"),

    # HVAC & Climate Control
    ("air conditioner in computer lab not cooling properly", "HVAC & Climate Control"),
    ("water continuously dripping inside classroom from split ac", "HVAC & Climate Control"),
    ("ac compressor in seminar hall making loud grinding metallic sound", "HVAC & Climate Control"),
    ("central ac thermostat in library stuck at freezing", "HVAC & Climate Control"),
    ("room ac remote sensor unresponsive and ac won't power on", "HVAC & Climate Control"),
    ("heavy vibration and rattling sound from lab duct ventilation", "HVAC & Climate Control"),
    ("ac cooling coil iced up and room temperature is warm", "HVAC & Climate Control"),
    ("foul burning dust smell coming from auditorium ac vent", "HVAC & Climate Control"),
    ("exhaust fan in store room not functioning", "HVAC & Climate Control"),
    ("server room precision cooling unit showing high temperature alert", "HVAC & Climate Control"),
    ("classroom split air conditioner blowing hot air instead of cool air", "HVAC & Climate Control"),
    ("ac condenser fan stopped spinning outdoor unit overheating", "HVAC & Climate Control"),
    ("air flow very weak from hvac ceiling diffuser duct", "HVAC & Climate Control"),
    ("ac filter completely choked with thick black dust", "HVAC & Climate Control"),
    ("cooling gas refrigerant leak detected oily residue around ac", "HVAC & Climate Control"),
    ("hvac blower motor vibrating loudly causing ceiling shake", "HVAC & Climate Control"),
    ("split ac indoor unit leaking water onto teacher desk", "HVAC & Climate Control"),

    # IT & Computer Labs
    ("lan internet port not working at workstation row in lab", "IT & Computer Labs"),
    ("projector in room showing blurry image and red lamp error", "IT & Computer Labs"),
    ("desktop computer failing to boot with bios beep sound", "IT & Computer Labs"),
    ("campus wi-fi access point in corridor showing red light", "IT & Computer Labs"),
    ("smart podium audio system has loud static hum and mic cutoffs", "IT & Computer Labs"),
    ("computer monitor display screen flickering with vertical lines", "IT & Computer Labs"),
    ("ethernet cable crimp clip broken cable drops connection", "IT & Computer Labs"),
    ("hdmi cable to interactive digital whiteboard damaged", "IT & Computer Labs"),
    ("library barcode scanner and computer interface not detected", "IT & Computer Labs"),
    ("lab network switch rack packet drops causing slow lab network", "IT & Computer Labs"),
    ("projector remote missing and ceiling mount loose", "IT & Computer Labs"),
    ("cpu cabinet power button jammed computer shuts down immediately", "IT & Computer Labs"),
    ("keyboard keys missing and mouse optical sensor malfunctioning", "IT & Computer Labs"),
    ("lab router gateway unresponsive students cannot connect to internet", "IT & Computer Labs"),
    ("interactive touch panel screen calibration displaced", "IT & Computer Labs"),
    ("audio speakers buzzing loudly in multimedia room", "IT & Computer Labs"),
    ("vga hdmi converter port burnt out no display on projector", "IT & Computer Labs"),

    # Civil & Furniture
    ("student bench desk leg broken and wobbling in room", "Civil & Furniture"),
    ("door lock latch jammed cannot lock classroom", "Civil & Furniture"),
    ("window glass pane cracked after strong wind in block", "Civil & Furniture"),
    ("whiteboard coating peeling off in room marker won't erase", "Civil & Furniture"),
    ("floor tiles loose and broken near library main entrance", "Civil & Furniture"),
    ("door hinge squeaking and sagging door scraping the floor", "Civil & Furniture"),
    ("false ceiling plaster tile sagging and loose above desk", "Civil & Furniture"),
    ("lecture podium wooden drawer hinge broken", "Civil & Furniture"),
    ("staircase handrail loose and unsteady between floors", "Civil & Furniture"),
    ("notice board glass slider locked and sliding track broken", "Civil & Furniture"),
    ("auditorium chair armrest detached and cushioned seat torn", "Civil & Furniture"),
    ("classroom door handle fell off cannot open from inside", "Civil & Furniture"),
    ("plaster peeling off wall dampness showing brick work", "Civil & Furniture"),
    ("window frame latch loose glass rattling in wind", "Civil & Furniture"),
    ("wooden table drawer jammed locked with essential documents", "Civil & Furniture"),
    ("ceramic tile chipped trip hazard for students in corridor", "Civil & Furniture"),
    ("window blinds cord snapped cannot close curtain blinds", "Civil & Furniture"),

    # Sanitation & Hygiene
    ("garbage dustbins overflowing outside ground floor canteen", "Sanitation & Hygiene"),
    ("washroom floor dirty and unhygienic with strong odor", "Sanitation & Hygiene"),
    ("liquid soap dispenser empty in restroom", "Sanitation & Hygiene"),
    ("discarded cups and food wrappers scattered around courtyard", "Sanitation & Hygiene"),
    ("pest and cockroach infestation observed in pantry area", "Sanitation & Hygiene"),
    ("sanitary napkin disposal bin broken in girls washroom", "Sanitation & Hygiene"),
    ("classroom dustbins not cleared since yesterday evening", "Sanitation & Hygiene"),
    ("stagnant rain water puddles near bike parking attracting mosquitoes", "Sanitation & Hygiene"),
    ("hand dryer in washroom clogged with dust and dirty air", "Sanitation & Hygiene"),
    ("bad sewage smell coming from cafeteria drainage grate", "Sanitation & Hygiene"),
    ("toilet seat dirty and uncleaned in faculty block", "Sanitation & Hygiene"),
    ("garbage dumping near back gate needs immediate clearing", "Sanitation & Hygiene"),
    ("rodent spotted near canteen food storage shelf", "Sanitation & Hygiene"),
    ("hand sanitizer dispenser bottle empty at entry gate", "Sanitation & Hygiene"),

    # Fire & Safety Equipment
    ("fire extinguisher pressure gauge needle in red recharge zone", "Fire & Safety Equipment"),
    ("emergency exit staircase door jammed and padlocked", "Fire & Safety Equipment"),
    ("fire alarm smoke detector in corridor blinking red and beeping", "Fire & Safety Equipment"),
    ("fire hose cabinet glass broken and nozzle valve leaking", "Fire & Safety Equipment"),
    ("emergency illumination battery backup light not turning on", "Fire & Safety Equipment"),
    ("fire escape sign board unlit and directional arrow fallen", "Fire & Safety Equipment"),
    ("manual fire pull station cover cracked in lobby", "Fire & Safety Equipment"),
    ("fire sprinkler head corroded and obstructed by banner", "Fire & Safety Equipment"),
    ("emergency siren speaker horn missing from 2nd floor", "Fire & Safety Equipment"),
    ("first aid medical kit box empty in sports room", "Fire & Safety Equipment"),
    ("evacuation route map missing from computer science department", "Fire & Safety Equipment"),
    ("fire extinguisher missing from safety bracket in lab", "Fire & Safety Equipment")
]

def train_and_save():
    print("=================================================================")
    print("JIMS MCA - AI Model Trainer: Campus Maintenance Classification")
    print("=================================================================")
    
    # Synthetic augmentation for higher statistical generalization
    expanded_rows = []
    modifiers = ["urgent", "please fix", "noticed today", "severe problem with", "recurrent issue of", "reported again:"]
    for text, cat in BASE_DATA:
        expanded_rows.append((text, cat))
        # Add slight variation with prefixes
        for mod in modifiers[:2]:
            expanded_rows.append((f"{mod} {text}", cat))

    df = pd.DataFrame(expanded_rows, columns=["text", "category"])
    print(f"Total augmented training samples: {len(df)}")
    print(df['category'].value_counts())
    
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['category'], test_size=0.20, random_state=42, stratify=df['category']
    )
    
    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        stop_words='english',
        sublinear_tf=True
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Logistic Regression with L2 regularization
    model = LogisticRegression(C=5.0, max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)
    
    y_pred = model.predict(X_test_vec)
    acc = accuracy_score(y_test, y_pred)
    print("\n---------------- Model Evaluation Metrics ----------------")
    print(f"Evaluation Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))
    
    # Fit full dataset
    X_all = vectorizer.fit_transform(df['text'])
    model.fit(X_all, df['category'])
    
    save_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(save_dir, "category_model.pkl")
    vec_path = os.path.join(save_dir, "vectorizer.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"[OK] Saved model to {model_path}")
    print(f"[OK] Saved vectorizer to {vec_path}")
    print("=================================================================")

if __name__ == "__main__":
    train_and_save()
