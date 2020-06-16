
// BUDGET CONTROLLER MODULE
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // all the Expense objects will inherit this method
    Expense.prototype.calculatePercentages = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // all the Expense objects will inherit this method
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value; 
    };

    var data = {
        items: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        // for each loop
        data.items[type].forEach(function(current, index, array) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, description, value) {
            var newItem, ID;

            // create new ID
            if (data.items[type].length > 0) {
                ID = data.items[type][data.items[type].length - 1].id + 1; // ID = last ID + 1
            } else {
                ID = 0;
            }

            // create new item
            if (type === 'inc') {
                newItem = new Income(ID, description, value);
            } else if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            }

            // save the new item into the data structure
            data.items[type].push(newItem);

            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;

            // array with all the ids
            ids = data.items[type].map(function(current, index, array) {
                return current.id;
            });

            // index of the element to delete
            index = ids.indexOf(id);

            if (index !== -1) {
                data.items[type].splice(index, 1); // first element: where to start, second element: how many elements to delete
            }
        },
        calculateBudget: function() {
            // calculate income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the pecertange of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function() {
            data.items.exp.forEach(function(current, index, array) {
                current.calculatePercentages(data.totals.inc);
            });
        },
        getPercentage: function() {
            var allPercentages = data.items.exp.map(function(current, index, array) {
                return current.getPercentage();
            });

            return allPercentages;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }; 
        },
        testing: function() {
            console.log(data);
        }
    };

})();

// UI CONTROLLER MODULE
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // list (node list) doesn't have forEach method (array has). Own forEach function for list (node list) implemented
    var nodeListForEach = function(nodeList, callback) {
        for (var i = 0; i < nodeList.length; i++) {
            callback(nodeList[i], i);
        }
    };

    var formatNumber = function(number, type) {
        /*
            + or - before number
            exactly 2 decimal points
            comma separating thousands

            2310.4567 -> 2,310.46
            2000 -> 2,000.00
        */

        var numberSplit, int, dec;

        number = Math.abs(number);
        number = number.toFixed(2); // it puts 2 decimal number and round it and return a string
        
        numberSplit = number.split('.'); // it divides the number into two parts, before and after the '.' An array is returned

        int = numberSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numberSplit[1];

        return (type === 'exp' ? '-' : '+' ) + ' ' + int + '.' + dec;
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  // return a list

            // list to array
            fieldsArray = Array.prototype.slice.call(fields);

            // forEach loop
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            // set focus to the description
            fieldsArray[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            // querySelector only returns the first one
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); // return a list (node list)

            // 
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayDate: function() {
            var now, year, months;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now = new Date();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[now.getMonth()] + ' ' + year;
        },
        changedType: function() {
            var fields;

            // return a list
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

// APP CONTROLLER MODULE
var appController = (function(budget, UI) {

    var setupEventListeners = function() {
        var DOM = UI.getDOMstrings();

        // add item - click event (click button)
        document.querySelector(DOM.inputBtn).addEventListener('click', appControllerAddItem);
    
        // add item - press key event (enter/return key)
        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                appControllerAddItem('.income__list');
            }
    
        });

        // delete item - click event (click 'x' button)
        // event delegation
        // event added to the container (common parent) to either catch a change in the income or expenses (children)
        document.querySelector(DOM.container).addEventListener('click', appControllerDeleteItem);

        // boxes border are green if it is an income, otherwise boxes border are red
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    };

    var updateBudget = function() {
        // calculate the budget
        budgetController.calculateBudget();

        // return the budget
        var budget = budgetController.getBudget();
        
        // display the budget on the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = function() {
        // calculate the percentages
        budgetController.calculatePercentages();

        // read percentages from the budget controller
        var percentages = budgetController.getPercentage();

        // update UI with the new percentages
        UIController.displayPercentages(percentages);
    };

    var appControllerAddItem = function() {
        var input, newItem;

        // get the filled input data
        input = UI.getInput();
        
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            
            // add the item to the UI
            UIController.addListItem(newItem, input.type);

            // clear the fields
            UIController.clearFields();
            
            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    var appControllerDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // traversing the DOM (reach the parent node id that it needs it)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // coerced to true if it exits, otherwise coersed to false
        if (itemID) {
            splitID = itemID.split('-'); // an array is created: ['inc or exp', 'x']
            type = splitID[0];
            ID = parseInt(splitID[1]); // ID is a string

            // delete the item from data structure
            budgetController.deleteItem(type, ID);

            // delete the item from the UI
            UIController.deleteListItem(itemID);

            // update and show the new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started...');
            UIController.displayDate();
            // set everything to 0 at the beginning
            UIController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// APP INITIALIZATION
appController.init();
