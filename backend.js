var container = document.getElementById('container');

container.innerHTML += 'Hello ';
var user_name ;
var user_handle_name ;
async function getData(){
    console.log('Hi we entered the async function ');
    let data = await fetch('/getFormData');
    let convertData = await data.json();

    user_name = convertData.user_name;
    user_handle_name = convertData.user_handle_name;
    container.innerHTML += user_name;
    container.innerHTML += user_handle_name;
}
getData();

console.log(user_handle_name);
var qus = document.getElementById('ques');
var button = document.getElementById('button');

async function getQuestions(){
    let url_problemSet = 'https://codeforces.com/api/problemset.problems?tags=implementation';
    let url_userProblems = ' https://codeforces.com/api/user.status?handle='+user_handle_name+'&from=1&count=10';

    let data1 = await fetch(url_problemSet);
    let data2 = await fetch(url_userProblems);

    let convertData1 = await data1.json();
    let convertData2 = await data2.json();

    console.log(convertData2.result);
    // console.log((convertData2.result).length());
    let arr2 = convertData2.result;
    let arr1 = convertData1.result.problems;
    
    let new_arr = [];
    
    let counter = 0;
    while(counter<25){
        new_arr.push(arr1[counter]);
        counter++;
    }

    for(let i = 0 ; i<25; i++){
        let isPresent = false;
        for(let j = 0; j<10; j++){
            if(arr2[j] == arr1[i]){
                isPresent = true;
            }
        }
        if(isPresent != true){
            qus.innerHTML += arr1[i].contestId ;
            qus.innerHTML += "\n";
            qus.innerHTML += arr1[i].index;  
        }
    }
    console.log(new_arr);


}
button.addEventListener('click',getQuestions);
