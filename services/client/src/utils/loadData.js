import { data } from "../assets/data_full.json"

function loadData(){
    const dates = data.map((item) => item.date)
    const unique_dates = [...new Set(dates)]

    let indexed_by_date = {};

    const filtered_data = data.filter((item) => item.parameter === "lambda")

    const meanArray = filtered_data.map((item) => item.mean);
    const dmin = Math.min(...meanArray);
    const dmax = Math.max(...meanArray);


    filtered_data.map((item) => {
      if (item.parameter == "lambda"){
      if(indexed_by_date[item.date]){
        indexed_by_date[item.date][item.location] = item
      }
      else{
        indexed_by_date[item.date]={}
        indexed_by_date[item.date][item.location] = item
        
      }
    }
    })
    
    return([data,indexed_by_date,unique_dates,dmin,dmax]);
  }


export {loadData}