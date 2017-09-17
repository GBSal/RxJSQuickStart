module.exports = {
    entry:"./main",
    output:{filename:"app.js"},
    module:{
        rules:[
                {
                    test:/.ts$/ ,
                    use:"ts-loader",
                    exclude:/node_modules/
                }
            ]
    },
    resolve:{ 
        extensions :[".ts",".js"] 
    }


};