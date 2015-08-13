/* @pjs preload="
  img/feathers/crow_feather1_V3-2.png,
  img/feathers/crow_feather2_V3-2.png,
  img/feathers/crow_feather3_V3-2.png,
  img/feathers/crow_feather1_V3-1.png,
  img/feathers/crow_feather2_V3-1.png,
  img/feathers/crow_feather3_V3-1.png,
  img/feathers/dove_feather1_V1-3.png,
  img/feathers/dove_feather2_V1-3.png,
  img/feathers/dove_feather3_V1-3.png"; */

//author: Alessa Gross

int ORIGINAL_WIDTH = 1635;

int canvasWidth;
int canvasHeight;

int transX = 735;
int transY = 925;

int minInput = 0;
int minOutput;

float minDegree = 0.5;
float maxDegree = 8.6;

float outerFeatherH = 70;
float outerFeatherW = outerFeatherH * 4.5;
int outerFeatherN = 20;

float middleFeatherH = outerFeatherH;
float middleFeatherW = outerFeatherH * 3.1;
int middleFeatherN = 20;

float innerFeatherH = outerFeatherH;
float innerFeatherW = outerFeatherH * 0.9;
int innerFeatherN = 20;


PImage crow_feather1outer = loadImage("img/feathers/crow_feather1_V3-2.png");
PImage crow_feather2outer = loadImage("img/feathers/crow_feather2_V3-2.png");
PImage crow_feather3outer = loadImage("img/feathers/crow_feather3_V3-2.png");

PImage crow_feather1middle = loadImage("img/feathers/crow_feather1_V3-1.png");
PImage crow_feather2middle = loadImage("img/feathers/crow_feather2_V3-1.png");
PImage crow_feather3middle = loadImage("img/feathers/crow_feather3_V3-1.png");

PImage crow_feather1inner = loadImage("img/feathers/crow_feather1_V3-1.png");
PImage crow_feather2inner = loadImage("img/feathers/crow_feather2_V3-1.png");
PImage crow_feather3inner = loadImage("img/feathers/crow_feather3_V3-1.png");


PImage dove_feather1outer = loadImage("img/feathers/dove_feather1_V1-3.png");
PImage dove_feather2outer = loadImage("img/feathers/dove_feather2_V1-3.png");
PImage dove_feather3outer = loadImage("img/feathers/dove_feather3_V1-3.png");

PImage dove_feather1middle = loadImage("img/feathers/dove_feather1_V1-3.png");
PImage dove_feather2middle = loadImage("img/feathers/dove_feather2_V1-3.png");
PImage dove_feather3middle = loadImage("img/feathers/dove_feather3_V1-3.png");

PImage dove_feather1inner = loadImage("img/feathers/dove_feather1_V1-3.png");
PImage dove_feather2inner = loadImage("img/feathers/dove_feather2_V1-3.png");
PImage dove_feather3inner = loadImage("img/feathers/dove_feather3_V1-3.png");


int[] randomFeathers;


void setup(){
  
  canvasWidth = windowW/3;
  canvasHeight = canvasWidth/1.16;
  minOutput = canvasHeight;
  
  size(canvasWidth, canvasHeight);
  //size( 1635,1415);
  background( 200 );
  frameRate( 24 );
 

  crow_randomFeathers = {2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,1,3,2,1,1,2,2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,1,3,2,1,1,2,3,2,1,3,2,1,1,2,2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,1,3,2,1,1,2};
  dove_randomFeathers = {2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,1,3,2,1,1,2,2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,3,1,2,1,1,2,3,2,1,3,2,1,1,2,2,3,2,1,3,2,1,2,3,1,3,2,1,3,2,1,1,2,1,2,3,1,3,2,3,2,1,3,2,1,1,2};
  
}


void draw(){
    scale((windowW/3)/ORIGINAL_WIDTH,(windowW/3)/ORIGINAL_WIDTH);
    if(bird == "dove") background(55,55,55);
    else  background(210,210,215);
    
    float leftDegree  = radians(lDeg);
    drawWing(leftDegree);
    
    float rightDegree  = radians(rDeg);
    translate(1630,0);
    scale(-1, 1);
    drawWing(rightDegree);
    scale(-1, 1);
    translate(-1630,0);   
}



void drawWing(degree){      
  
 /*   if(degree < minDegree) degree = minDegree;
   if(degree > maxDegree) degree = maxDegree; */
 
   // ====================== Outer row START =======================     
   translate(transX,transY);
   rotate(radians(-67+180));  
    
   float fWidth = outerFeatherW;
   float fHeight = outerFeatherH;
    
   if(bird == "dove") image(dove_feather2outer, 0, 0, fWidth, fHeight);
   else image(crow_feather2outer, 0, 0, fWidth, fHeight);
   
   for (int i = 0; i < outerFeatherN; i += 1) {
      if(11 < i && i <19) fWidth = fWidth * 1.1;
     
      translate(-(degree*-0.4),degree*2.7);
      rotate(radians(degree));
      
      int featherNumber;
      if(bird == "dove") featherNumber = dove_randomFeathers[i];
      else  featherNumber = crow_randomFeathers[i];
      
      switch(featherNumber){
         case 1:
            if(bird == "dove") image(dove_feather1outer, 0, 0, fWidth, fHeight);
            else image(crow_feather1outer, 0, 0, fWidth, fHeight);
            break;
         case 2: 
            if(bird == "dove") image(dove_feather2outer, 0, 0, fWidth, fHeight);
            else image(crow_feather2outer, 0, 0, fWidth, fHeight);
            break;
         case 3: 
            if(bird == "dove") image(dove_feather3outer, 0, 0, fWidth, fHeight);
            else image(crow_feather3outer, 0, 0, fWidth, fHeight);
            break;
      }
   }
   for (int i = 0; i < outerFeatherN; i += 1) {
      rotate(radians(-degree));
      translate(degree*-0.4,-(degree*2.7));
   } 
   rotate(radians(-(-67+180)));
   translate(-transX,-transY);     
   // ====================== Outer row END ==========================    



      
   // ====================== Middle row START =======================    
   translate(transX,transY-70);
   rotate(radians(-67+180));  
  
   fWidth = middleFeatherW;
   fHeight = middleFeatherH;
    
   if(bird == "dove") image(dove_feather2middle, 0, 0, fWidth, fHeight);
   else image(crow_feather2middle, 0, 0, fWidth, fHeight);
  
   for (int i = 0; i < middleFeatherN; i += 1) {
      if(11 < i && i <19) fWidth = fWidth * 1.1;
      
      translate(-(degree*-0.4),degree*1.3);
      rotate(radians(degree));
      
      int featherNumber;
      if(bird == "dove") featherNumber = dove_randomFeathers[i + outerFeatherN];
      else  featherNumber = crow_randomFeathers[i + outerFeatherN];
      
      switch(featherNumber){
         case 1:
            if(bird == "dove") image(dove_feather1middle, 0, 0, fWidth, fHeight);
            else image(crow_feather1middle, 0, 0, fWidth, fHeight);
            break;
         case 2: 
            if(bird == "dove") image(dove_feather2middle, 0, 0, fWidth, fHeight);
            else image(crow_feather2middle, 0, 0, fWidth, fHeight);
            break;
         case 3: 
            if(bird == "dove") image(dove_feather3middle, 0, 0, fWidth, fHeight);
            else image(crow_feather3middle, 0, 0, fWidth, fHeight);
            break;
      }
   }
   for (int i = 0; i < outerFeatherN; i += 1) {
      rotate(radians(-degree));
      translate(degree*-0.4,-(degree*1.3));
   } 
   rotate(radians(-(-67+180)));
   translate(-transX,-(transY-70));  
   // ====================== Middle row END =======================   


      
   // ====================== Inner row START =======================    
   translate(transX,transY-70);
   rotate(radians(-67+180));  
    
   fWidth = innerFeatherW;
   fHeight = innerFeatherH;
    
   if(bird == "dove") image(dove_feather3inner, 0, 0, fWidth, fHeight);
   else image(crow_feather3inner, 0, 0, fWidth, fHeight);
   
   for (int i = 0; i < innerFeatherN; i += 1) {
      if(11 < i && i <19) fWidth = fWidth * 1.1;
      
      translate(-(degree*-0.4),degree*1.3);
      rotate(radians(degree));
      
      int featherNumber;
      if(bird == "dove") featherNumber = dove_randomFeathers[i + outerFeatherN + middleFeatherN];
      else  featherNumber = crow_randomFeathers[i + outerFeatherN + middleFeatherN];
      
      switch(featherNumber){
         case 1:
            if(bird == "dove") image(dove_feather1inner, 0, 0, fWidth, fHeight);
            else image(crow_feather1inner, 0, 0, fWidth, fHeight);
            break;
         case 2: 
            if(bird == "dove") image(dove_feather2inner, 0, 0, fWidth, fHeight);
            else image(crow_feather2inner, 0, 0, fWidth, fHeight);
            break;
         case 3: 
            if(bird == "dove") image(dove_feather3inner, 0, 0, fWidth, fHeight);
            else image(crow_feather3inner, 0, 0, fWidth, fHeight);
            break;
      }
   }
   for (int i = 0; i < outerFeatherN; i += 1) {
      rotate(radians(-degree));
      translate(degree*-0.4,-(degree*1.3));
   } 
   rotate(radians(-(-67+180)));
   translate(-transX,-(transY-70));  
   // ====================== Inner row END =======================        
}










