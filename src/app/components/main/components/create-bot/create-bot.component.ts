import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BotService } from 'src/app/core/services/bot.service';

@Component({
  selector: 'app-create-bot',
  templateUrl: './create-bot.component.html',
  styleUrl: './create-bot.component.scss'
})
export class CreateBotComponent implements OnInit {

  createBotForm : FormGroup;
  configData;
  selectData = {
    broker: [],
    strategy: [],
    symbol: []
  };
  additionalParams = [];
  selectedSymbolTimeframe = '';

  constructor(
    private fb: FormBuilder,
    private botService: BotService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.botService.fetchConfigurationData().subscribe((data) => {
      if(data){
        this.configData = data;
        const brokers = this.configData.configuration?.brokers || [];
        brokers.forEach((broker) => {
          this.selectData.broker.push({name: broker.name, label: broker.name});
        });
      }
      else{
        this.toastr.error('Failed to fetch configuration data', 'Error');
      }
    }, (error) => {
      this.toastr.error('Failed to fetch configuration data', 'Error');
    });
    this.initiateForm();
  }

  initiateForm() {
    let obj = {};
    Object.values(this.formFields).forEach((value) => {
      obj[value.apiKey] = [
        value.value,
        value.required ? Validators.required : null,
      ];
    });
    this.createBotForm = this.fb.group(obj);
  }

  onBrokerChange(event) {
    const brokerName = event.target.value;
    const broker = this.configData.configuration.brokers.find((item) => item.name === brokerName);
    this.selectData.strategy = broker.strategies.map((strategy) => {
      return {name: strategy.name, label: strategy.name};
    });

    // reset form fields and add additional params fields for the selected broker
    this.createBotForm = this.fb.group({
      broker: [brokerName, Validators.required],
      strategy: ['', Validators.required],
      symbol: ['', Validators.required],
      timeframe: ['', Validators.required],
      botName: ['', Validators.required],
    });

    this.additionalParams = [];
    this.additionalParams = Object.keys(broker.additionalParams).map((key) => {
      return {
        type: broker.additionalParams[key].type,
        label: broker.additionalParams[key].title,
        apiKey: key,
        value: '',
        required: broker.additionalParams[key].required,
        placeholder: broker.additionalParams[key].desc,
        placeholder2: '',
        disabled: false,
        readonly: false,
      }
    });
    this.additionalParams.forEach((param) => {
      this.createBotForm.addControl(param.apiKey, this.fb.control('', param.required ? Validators.required : null));
    });
  }

  onStrategyChange(event) {
    const strategyName = event.target.value;
    const brokerName = this.createBotForm.value.broker;
    const broker = this.configData.configuration.brokers.find((item) => item.name === brokerName);
    const strategy = broker.strategies.find((item) => item.name === strategyName);
    this.selectData.symbol = strategy.symbols.map((symbol) => {
      const combinedStr = symbol.symbol + " | " + symbol.timeframes[0].timeframe;
      return {name: combinedStr, label: combinedStr, timeframe: symbol.timeframes[0].timeframe, symbol: symbol.symbol};
    });
  }

  onSymbolChange(event) {
    const symbolObj = this.selectData.symbol.find((item) => item.name === event.target.value);

    this.createBotForm.patchValue({
      symbol: symbolObj.symbol,
      timeframe: symbolObj.timeframe,
    });
  }

  onSubmit(){
    const payload = {};
    Object.keys(this.createBotForm.value).forEach((key) => {
      payload[key] = this.createBotForm.value[key];
    });
    payload['params'] = {};
    this.additionalParams.forEach((param) => {
      payload['params'][param.apiKey] = this.createBotForm.value[param.apiKey];
    });
    console.log("payload", payload);

    this.botService.createBot(payload).subscribe({
      next: (data:any) => {
        if(data && data?.success){
          this.toastr.success('Bot created successfully', 'Success');
          this.resetForm();
        }
        else{
          let errorMessage = 'Failed to create bot. ' + data?.message;
          this.toastr.error(errorMessage, 'Error');
        }
      }, 
      error: (error) => {
        let errorMessage = 'Failed to create bot. ' + error?.message;
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }

  resetForm(){
    this.createBotForm.reset();
    this.additionalParams = [];
    this.selectData.strategy = [];
    this.selectData.symbol = [];
    this.initiateForm();
  }

  formFields = {
    broker: {
      type: 'text',
      label: 'Broker',
      apiKey: 'broker',
      value: null,
      required: true,
      placeholder: 'Select Broker',
      placeholder2: 'Select Broker',
      disabled: false,
      readonly: false,
      // max_length: 50,
    },
    strategy: {
      type: 'text',
      label: 'Strategy',
      apiKey: 'strategy',
      value: null,
      required: true,
      placeholder: 'Select Strategy',
      placeholder2: 'First Select Broker',
      disabled: false,
      readonly: false,
      // max_length: 50,
    },
    symbol: {
      type: 'text',
      label: 'Symbol',
      apiKey: 'symbol',
      value: null,
      required: true,
      placeholder: 'First Select Strategy',
      placeholder2: 'First Select Strategy',
      disabled: false,
      readonly: false,
      // max_length: 50,
    },
    timeframe: {
      type: 'text',
      label: 'Timeframe',
      apiKey: 'timeframe',
      value: '',
      required: true,
      placeholder: 'Enter Timeframe',
      placeholder2: 'Enter Timeframe',
      disabled: false,
      readonly: false,
      // max_length: 50,
    },
    botName: {
      type: 'text',
      label: 'Bot Name',
      apiKey: 'botName',
      value: '',
      required: true,
      placeholder: 'Enter Bot Name',
      placeholder2: 'Enter Bot Name',
      disabled: false,
      readonly: false,
      // max_length: 50,
    },
  };
}

// example configuration data
// {
//   "configuration": {
//       "brokers": [
//           {
//               "name": "deriv",
//               "strategies": [
//                   {
//                       "name": "test_deriv",
//                       "feedClass": "DerivFeed",
//                       "symbols": [
//                           {
//                               "symbol": "R_10",
//                               "timeframes": [
//                                   {
//                                       "timeframe": "M1",
//                                       "timeframeInSeconds": 60,
//                                       "supportingSymbolAndTF": [
//                                           {
//                                               "symbol": "R_10",
//                                               "timeframe": "M2",
//                                               "timeframeInSeconds": 120
//                                           },
//                                           {
//                                               "symbol": "R_10",
//                                               "timeframe": "M3",
//                                               "timeframeInSeconds": 180
//                                           }
//                                       ]
//                                   }
//                               ]
//                           }
//                       ]
//                   },
//                   {
//                       "name": "reversal_mean_reversion",
//                       "feedClass": "DerivFeed",
//                       "symbols": [
//                           {
//                               "symbol": "R_10",
//                               "timeframes": [
//                                   {
//                                       "timeframe": "M1",
//                                       "timeframeInSeconds": 60,
//                                       "supportingSymbolAndTF": [
//                                           {
//                                               "symbol": "R_10",
//                                               "timeframe": "M2",
//                                               "timeframeInSeconds": 120
//                                           },
//                                           {
//                                               "symbol": "R_10",
//                                               "timeframe": "M3",
//                                               "timeframeInSeconds": 180
//                                           }
//                                       ]
//                                   }
//                               ]
//                           }
//                       ]
//                   }
//               ],
//               "additionalParams": {
//                   "appId": {
//                       "type": "number",
//                       "required": true,
//                       "title": "Application ID",
//                       "desc": "The application ID provided by the broker."
//                   },
//                   "authToken": {
//                       "type": "string",
//                       "required": true,
//                       "title": "Authentication Token",
//                       "desc": "The authentication token provided by the broker."
//                   }
//               }
//           }
//       ]
//   },
//   "success": true
// }
