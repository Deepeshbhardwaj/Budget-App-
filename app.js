var budgetController = (function (){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        } else{
            this.percentage = -1;
        } 
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type]=sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1

    }

    return {
         addItem: function(type, des, val) {
             var newItem, ID;
             if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
             }else {
                 ID=0;
             }
             
             if (type === 'exp'){
                newItem = new Expense(ID,des,val);
             }else if (type === 'inc'){
                 newItem = new Income(ID,des,val);
             }
             data.allItems[type].push(newItem);

            //  Return the new element
             return newItem;
         },

         deleteItem: function(type,id) {
             var ids, index;
             ids = data.allItems[type].map(function(current){
                 return current.id;
             });

             index = ids.indexOf(id);

             if (index !== -1) {
                data.allItems[type].splice(index, 1);
             }
         },

         calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
         },

         calculatePercentages: function() {
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
         },

         getPercentages: function() {
            var allperc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allperc;
         },

         getbudget: function() {
             return {
                 budget:data.budget,
                 totalInc: data.totals.inc,
                 totalsExp: data.totals.exp,
                 percentage: data.percentage
             };
         },

         testing: function(){
             console.log(data)
         }
    };
    
})();





var UIController = (function () {

    var Domstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numsplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback){
        for (var i=0; i < list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getinput: function(){
            return{
                type: document.querySelector(Domstrings.inputType).value,
                description: document.querySelector(Domstrings.inputDescription).value,
                value: parseFloat(document.querySelector(Domstrings.inputValue).value),
            };
        },
        
        addListItem: function(obj,type){
            var html,newhtml,element;

            if (type === 'inc'){
                element = Domstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = Domstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',this.formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields=document.querySelectorAll(Domstrings.inputDescription + ',' + Domstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(Domstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(Domstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(Domstrings.expenseLabel).textContent = formatNumber(obj.totalsExp,'exp');

            if (obj.percentage > 0) {
                document.querySelector(Domstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(Domstrings.percentageLabel).textContent  = '----';
            }
        },

        displayPecentages: function(percentage){
            var fields = document.querySelectorAll(Domstrings.expensesPercentagesLabel);

        

            nodeListForEach(fields, function(current,index){
                if (percentage[index] > 0){
                    current.textContent = percentage[index]+"%";
                } else {
                    current.textContent = "---"
                }
                
            });
        },

        displayMonth: function() {
            var now,month,months,year;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','Octuber','November','December'];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(Domstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        changeType: function() {
            var Fields = document.querySelectorAll(
                Domstrings.inputType + ',' + Domstrings.inputDescription + ',' + Domstrings.inputValue
            );

            nodeListForEach(Fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(Domstrings.inputBtn).classList.toggle('red');
        },

        getDomstrings: function() {
            return Domstrings;
        }
    };

})();

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListners = function() {
        var Dom = UICtrl.getDomstrings();

        document.querySelector(Dom.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(Dom.container).addEventListener('click',ctrlDeletItem);

        document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getbudget();

        UICtrl.displayBudget(budget);
    };

    var updatepercentages = function() {

        // 1. Calclualte percentages
        budgetCtrl.calculatePercentages();

        // 2. Real percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new Percentages
        UICtrl.displayPecentages(percentages);

    };
    

    var ctrlAddItem = function(){
        var input, newItem;

        input = UICtrl.getinput();

        if(input.description !== "" && !isNaN(input.value) && input.value>0){
            
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            updateBudget();

            updatepercentages();
        }; 

    }

    var ctrlDeletItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID)

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatepercentages();

        }
    };



    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc: 0,
                totalsExp: 0,
                percentage: 0
            });
            setupEventListners();
        }
    }

})(budgetController,UIController);

controller.init();