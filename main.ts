import { Observable } from "rxjs";

// To reduce the size of the library use the one which is required
// import "rxjs/add/observable/fromEvent";
// import "rxjs/add/operator/map";
// import "rxjs/add/operator/mergeMap";
// import "rxjs/add/operator/retry";
// import "rxjs/add/operator/retryWhen";
// import "rxjs/add/operator/delay";

let numbers = [1, 2, 3, 4, 5];

let circle = document.getElementById("circle");


let circleSource = Observable.fromEvent(document, "mousemove")
    .map((e: MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        };
    })

circleSource.subscribe(value => {
    circle.style.left = value.x.toString();
    circle.style.top = value.y.toString();
})

// with time out invoke method
let soucetimeout = Observable.create(observer => {

    let index = 0;

    let productValue = () => {

        observer.next(numbers[index++]);

        if (index < numbers.length) {
            setTimeout(productValue, 1000);
        }
        if (index === numbers.length) {
            observer.complete();
        }
    }

    productValue();

}).map(x => x * 2);

soucetimeout.subscribe((value) => {
    console.log(`time out value ${value}`)
}, () => { }, () => {
    console.log(` completed`);
})

// Http requset with Xmlhttprequest

let button = document.getElementById("getMovies");
let output = document.getElementById("movieList");

let httpSource = Observable.fromEvent(button, "click");

function loadData(url: string) {
    return Observable.create(observer => {

        let http = new XMLHttpRequest();
        http.addEventListener("load", () => {
            if (http.status === 200) {
                let data = JSON.parse(http.responseText);
                observer.next(data);
                observer.complete();
            }
            else {
                observer.error(http.statusText);
            }
        });

        http.open("GET", url);
        http.send();

    }).retryWhen(retryStratergy({ attempts: 4, delay: 1000 }))

}

function retryStratergy({ attempts = 4, delay = 1000 }) {
    return function (errors) {
        return errors
            .scan((acc, value) => {
                console.log(acc, value);
                return acc + 1;
            }, 1).
            takeWhile(acc => acc <= attempts)
            .delay(delay);

    }

}

function renderMovies(data: any[]) {
    data.forEach((m) => {
        let div = document.createElement("div");
        div.innerText = m.title;
        output.appendChild(div);
    });

}

// To load with xmlHttpRequest Object use
//e => loadData("movies.json")
// To Load with WHATWG fetch method use 
// e => loadDataWithFetch();
// fetch is new standard only new browser is supporting it. 

httpSource.flatMap(e => loadDataWithFetch("movies.json"))
    .subscribe(
    renderMovies,
    e => console.log(`Error: ${e}`),
    () => console.log("Completed")
    );


// Load data using fetch, this is new standard brower already started using it.
// so if you go into console and type fetch you can see object return promise. 
// To use fetch you have to  unstalling typings of  dt~es6-shim and install dt~whatwg-streams --global --save
// and install typing dt~whatwg-fetch --save --global

// NO NEED TO INSTALL ABOVE AS TYPESCRIPT NOW INCLUDE THEM ALREADY
// JUST CHANGE THE TSCONFIG TO ES6 INSTEAD OF ES5
function loadDataWithFetch(url: string) {
    return Observable.defer(()=>{
        return Observable.fromPromise(
            fetch(url).then(r => {
                return r.json();
            }))

    })
  
};


loadDataWithFetch("movies.json").subscribe(renderMovies);