if(!document.addEventListener){ document.attachEvent('onDOMContentLoaded', callCalculator);}
	else { document.addEventListener('DOMContentLoaded', callCalculator); }

	//Put all functionality within scope of callCalculator:
	var callCalculator =  function (){

		//	We could use just four seperate variables, but one variable gives clarity between the connection of the operators and numbers
		//	JSON element to keep track of current operations in one place
		var currentValues = { firstNumber: "", secondNumber: "", fullEquation:"", operator: "", operatorExists: false }; 

		//All variables for HTML display:
		var result 	=  	document.getElementById('result');
		var error 	= 	document.getElementById('error') ;
		var tracker = 	document.getElementById('currentExpression');  //If JQuery was used, this would be written as $('#elementId') 

		/****** Reusable Code ******/			
		var stringNullOrEmpty = function(stringInput){
			return !stringInput || stringInput === "";
		}

		/****** Calculator main functionality ******/			
		var clearHtml = function(){
			result.innerText 	= '0'; 
			error.innerText 	= '';
			tracker.innerText 	= ''; 
		}; 

		var clearAllValues = function(){
			currentValues = { firstNumber: "", secondNumber: "", operator: "", operatorExists: false}; 
		};

		//ClearEach: Clear the last entered character - Check firstNumber, operator and secondNumber and update appropriate values
		var clear = function(){
			error.innerText = ''; 	

			if(!stringNullOrEmpty(currentValues.secondNumber)){
				currentValues.secondNumber = currentValues.secondNumber.toString().substr(0,currentValues.secondNumber.length-1);
				result.innerText = currentValues.secondNumber;
			}			
			else if(!stringNullOrEmpty(currentValues.operator)) {
					currentValues.operator = ''; 
					currentValues.operatorExists = false; 
					currentValues.secondNumber = currentValues.firstNumber;
					result.innerText = currentValues.secondNumber ;
					currentValues.firstNumber = '';
			}
			else if(!stringNullOrEmpty(currentValues.firstNumber)){	
				currentValues.firstNumber = currentValues.firstNumber.toString().substr(0,currentValues.firstNumber.length-1);
				result.innerText = currentValues.firstNumber;
			}

			//Edge case: If the user tried to clear 0, or tried deleting after emptying everything: 
			if(stringNullOrEmpty(currentValues.secondNumber) && stringNullOrEmpty(currentValues.firstNumber) && stringNullOrEmpty(currentValues.operator)) { 
				result.innerText = '0';
			}

			tracker.innerText =  currentValues.firstNumber + currentValues.operator + currentValues.secondNumber;  
		};

		/* negation is done by simply adding a '-' twice on current number
			Is is the only operation allowed twice continuously. */ 
		var negateNumber = function(inputNumber){		
				inputNumber = inputNumber.toString();	
			// Edge case 1: If number is empty, set it as negative 
			if(stringNullOrEmpty(inputNumber)){ 
						inputNumber = '-';
			}
			// Edge case 2: If number is (not) empty, the user has entered negation twice  
			else if(inputNumber.indexOf('-') === 0) { // Inverse negation: Make positive			
				inputNumber = inputNumber.substr(1,inputNumber.length); 
			} 
			//Edge case 3: Set new/current number for being negated
			else if(inputNumber!=='-') {
				// User is not attempting to set multiple negative signs
					inputNumber = '-'+inputNumber;
			}
			return inputNumber; 
		};

		//Inverse / Negate sign on current number, always apply negation to the newer number 
		var setInverseSign = function(event){
				error.innerText = ''; 	
				var enteredValue = '-'; 
				var currLength = currentValues.secondNumber.length;
				if(currentValues.operatorExists || stringNullOrEmpty(currentValues.firstNumber) ){
							currentValues.secondNumber = negateNumber(currentValues.secondNumber);		
							result.innerText = currentValues.secondNumber;
				}
				else if(!stringNullOrEmpty(currentValues.firstNumber)){
					currentValues.firstNumber = negateNumber(currentValues.firstNumber);
					result.innerText = currentValues.firstNumber;					
				}

				tracker.innerText =  currentValues.firstNumber + currentValues.operator + currentValues.secondNumber;

		}; 

		//Calculate: Do the math: Add, subtract, multiple or divide 
		var performCalculation =  function(firstNumber, operator, secondNumber){
			var number =0.0;
				if (operator === "+"){
				number = parseFloat(firstNumber, 10) + parseFloat(secondNumber,10);
				} else if (currentValues.operator === "-"){
					number = parseFloat(firstNumber, 10) - parseFloat(secondNumber,10);
				} else if (operator === "/" ){ //Divide  by 0 gives 0 because we do a parseFloat(10)
					number = parseFloat(firstNumber, 10) / parseFloat(secondNumber,10);
				} else if (operator === "*"){
					number = parseFloat(firstNumber, 10) * parseFloat(secondNumber,10);
				}			
				/*else if (operator === "%"){
					number = parseInt(firstNumber, 10) % parseInt(secondNumber,10);
				} */

			//Edge case: If the final math is performed, and user attempts to enter or press '=', then ensure you return
			if (operator === "=" && isNaN(number)){
				return;
			}

			if(isNaN(number) || number === 'Infinity' ) { 
				clear();
				error.innerText ='Not a number, please try a valid operation'; 
				return; 
			}
			else { 
				result.innerText = number.toString(10);
				return number; 
			}
		}; 	

		//Calculate: When user selects '=' or presses the enter key, return final result
		var finalCalculation = function(event, enteredValue){

	  	 error.innerText = ''; 
		  if(currentValues.operator!=='') {
			currentValues.firstNumber = performCalculation(currentValues.firstNumber, currentValues.operator, currentValues.secondNumber); 	
			currentValues.operatorExists = false; 	
			currentValues.operator = "";			
			currentValues.secondNumber = "";

			currentValues.fullEquation = currentValues.fullEquation + tracker.innerText + '=' + currentValues.firstNumber;
			console.log(currentValues.fullEquation);
			//tracker.innerText = currentValues.firstNumber + currentValues.operator + currentValues.secondNumber;
			result.innerText = currentValues.firstNumber;
		  }
		}		

		/* Numbers: Set the first and second number
					When an operator is applied, the first number is set using secondNumber that is initially set up.
					This way we maintain order of the entered numbers and the operator is applied correctly 
		*/
		var setNumbers = function(event){
				error.innerText =  ''; 	
				if(!event.target) { 
					return; 
				}

				var enteredValue =  event.target.innerText; 
				if(!enteredValue) { enteredValue = event.target.textContent;  }

				//Edge case 1: User should enter a valid number 
				if(!(typeof parseInt(enteredValue) === 'number')) {
					error.innerText = 'Please enter a valid number'; 
					return false;
				}	

				//Edge case 2: User should enter decimal point no more than once, per number
				//Preserve the oldest correct value, just display a message to user 
				if(enteredValue === '.' && currentValues.secondNumber.indexOf('.') >= 0) { 			
						error.innerText = 'Please enter only one decimal point per number';
						return false; 
				}

				currentValues.secondNumber += enteredValue; 
				if(currentValues.secondNumber === '.') { 
					currentValues.secondNumber = '0.';
				}
				//Using + instead of array.join or string.concat is faster as the other methods convert into +
				tracker.innerText = currentValues.firstNumber + currentValues.operator  + currentValues.secondNumber; 
				result.innerText = currentValues.secondNumber;			
		};

		/* Operator: Set up or update the operator, perform math when more calls are made
					 Store and perform operation, whenever there are two numbers.
					 Otherwise, store operation and wait for second number 
		*/ 
		var setOperators = function(event) { 
			error.innerText = ''; 					
			if(!event.target) { return; }
			var enteredValue =  event.target.innerText; 
			if(!enteredValue) { enteredValue = event.target.textContent ? event.target.textContent : '';  }
			if(enteredValue === '=' && currentValues.operator === '')	{ return; }

			if(!stringNullOrEmpty(enteredValue)){ // && currentValues.operatorExists){

				if(stringNullOrEmpty(currentValues.firstNumber) && stringNullOrEmpty(currentValues.secondNumber)){
					error.innerText = "Please enter numbers between an operator"; 						
				}				
			} 		

			// Edge case(s): If user has entered an operator more than once 
			//				If user doesn't have a number but attempts an operation
			if(stringNullOrEmpty(currentValues.secondNumber)) { //Either an operator is set, or the user didn't enter a number
				//User tried another operation 
				if(currentValues.operatorExists && !stringNullOrEmpty(currentValues.operator)){ 
					error.innerText = 'Please enter a number before the operator'; 
					tracker.innerText =  currentValues.firstNumber + currentValues.operator + currentValues.secondNumber ;
					return false; 
				}
			}		

			/* Works except when user enters two operators together, then we have set the secondNumber to 0
				Will always ensure user enters a number, operator and another number. 
				Happens when user tried to perform another operation, so ensure that secondNumber is not reset, i.e.
				user has entered a second number
			*/
			if(currentValues.operatorExists) {
				// User already entered an operator. Check if a second number exists.
				if(!stringNullOrEmpty(currentValues.secondNumber) && !stringNullOrEmpty(currentValues.operator) && !stringNullOrEmpty(currentValues.firstNumber)){
					currentValues.firstNumber = performCalculation(currentValues.firstNumber, currentValues.operator, currentValues.secondNumber); 
					currentValues.operatorExists = true; 
				}
			}	
			else {					
				// Set up the first number, then wait for the user to finish the second number. 
				if(!stringNullOrEmpty(currentValues.secondNumber)) 
					currentValues.firstNumber = currentValues.secondNumber; 
				currentValues.operatorExists = true; 
			}

			// If the user entered '=' the first time, update the UI, otherwise just return
			if(enteredValue!=='=') { 
				currentValues.operator = enteredValue;  
			} 
			else { 
				if(!currentValues.operatorExists) {return ; }
			}

			currentValues.secondNumber = ""; 		
			currentValues.fullEquation = tracker.innerText;
			tracker.innerText = currentValues.firstNumber + currentValues.operator  + currentValues.secondNumber; 
			result.innerText = currentValues.firstNumber;

	};	

	
	var getElementsByClassNameBackup = function(classToReplace /*, valueToReplace */){
			//In our code we have only span elements that use class: operator/number
			var spanElements = document.getElementsByTagName('span');  
			var returnElements; 
			for (var i in spanElements) { //Loop by key value in object of span elements
				if((spanElements[i].className).indexOf(classToReplace)> 0) {
					//if(valueToReplace){ 
					//	spanElements[i].innerText = valueToReplace;
					//}
					returnElements[i] = spanElements[i]; 
				}
			}
			return returnElements; 
	};


	var setEventHandlerForClass = function(className, callback, eventName){
			if(typeof document.getElementById('calculator').getElementsByClassName(className) !='undefined') {
				var els = document.getElementById('calculator').getElementsByClassName(className);
				for(var i = 0; i < els.length; i++) {
					if(els[i].addEventListener) { els[i].addEventListener(eventName,  function(e) { callback(e); }); }
					else {
						//Workaround when addEventListener is not supported.
						els[i].attachEvent(eventName,  function(e) { callback(e); }); 
						}
						//Can also directly apply
						//els[i].onclick = function(e) { callback(e); }; 	
					}
			}
			else {
				var els = getElementsByClassNameBackup(className);
				for(var i = 0; i < els.length; i++) { 
					if(els[i].addEventListener) { els[i].addEventListener(eventName, function(e) { callback(e); }); }
					else { els[i].attachEvent(eventName,  function(e) { callback(e); }); }
				}; 	
			}		
	};

	

	
	var setKeypressEvents = function(event){ 
		//Keycodes were NOT googled (though it was very tempting)
		//event.code - In Chrome, not in IE9
		//event.char, event.key - IE9, not in Chrome
		//Press all possible current calculator events and write up similar click calls:	
		if(console && console.log) { console.log('event.keyCode: '+ event.keyCode + ', event.code: '+event.code);  }
			
			var keycode = (event.keyCode ? event.keyCode : event.which);   
			if(!keycode) { 
				error.innerText = 'Please enter two numbers seperated by an operator';
			}

			//	numbers keycode: 48 - 57 
			if(keycode >=48 && keycode<=57){
				var classCode = keycode - 48;
				var numericEls = document.getElementsByClassName("num-" + classCode); 

				for (var i = 0; i < numericEls.length; i++) {
						numericEls[i].click();
				}
			} 			

			if(keycode === 46) {
				var decimalEl = document.getElementsByClassName("decimal"); 
				decimalEl[0].click(); 
				
			}

			if(keycode === 47 || keycode === 42 || keycode === 43 || keycode === 45 || keycode === 37){
				var operatorEls = document.getElementsByClassName("code-" + keycode);
				for (var i = 0; i < operatorEls.length; i++) {
						operatorEls[i].click();
				}
			}

			if(keycode===61 || keycode ===13) {
				document.getElementById('calculate').click();
			}
	};	

	
	setEventHandlerForClass('number', setNumbers, 'click'); 
	setEventHandlerForClass('operator', setOperators, 'click'); 

	if(!document.addEventListener){	//IE8-
			document.onkeypress = function(e) { setKeypressEvents(e); }	
			document.getElementById('clearEntry').attachEvent('onclick', function(){ clear(); });
			document.getElementById('negateSign').attachEvent('onclick', function(){ setInverseSign(); });
			document.getElementById('allClear').attachEvent('onclick', function(){ clearHtml();	clearAllValues(); });
			document.getElementById('calculate').attachEvent('onclick', function(){ finalCalculation(); });
	}else{
			
			document.addEventListener('keypress', function(event){
				   setKeypressEvents(event); 
			});

			document.getElementById('clearEntry').addEventListener('click', function(){
				clear(); 		
			});

			document.getElementById('negateSign').addEventListener('click', function(){
				setInverseSign();
			});

			document.getElementById('allClear').addEventListener('click', function(){
				clearHtml();
				clearAllValues();
			});

			
			document.getElementById('calculate').addEventListener('click', function(){
				finalCalculation(); 
			});						
	 }		
  }(); 