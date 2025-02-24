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
  };
  additionalParams = [];
  configurableParams = [];

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
          this.selectData.broker.push({name: broker.brokerName, label: broker.desc});
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
    const broker = this.configData.configuration.brokers.find((item) => item.brokerName === brokerName);
    this.selectData.strategy = broker.strategies.map((strategy) => {
      return {name: strategy.strategyName, label: strategy.desc};
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
    this.additionalParams = broker.additionalParams.map((param) => {
      return {
        type: param.type,
        label: param.title,
        apiKey: param.name,
        value: param.default || null,
        required: param.required,
        placeholder: param.desc,
        placeholder2: '',
        disabled: false,
        readonly: false,
      };
    });
    this.additionalParams.forEach((param) => {
      this.createBotForm.addControl(param.apiKey, this.fb.control(param.value||null, param.required ? Validators.required : null));
    });
  }

  onStrategyChange(event) {
    this.configurableParams = [];
    const strategyName = event.target.value;

    const brokerName = this.createBotForm.value.broker;
    const broker = this.configData.configuration.brokers.find((item) => item.brokerName === brokerName);
    const strategy = broker.strategies.find((item) => item.strategyName === strategyName);

    this.configurableParams = [];
    strategy.configurableParams.forEach((param) => {
      this.configurableParams.push({
        type: param.type,
        label: param.title,
        apiKey: param.name,
        value: param.default || null,
        required: param.required,
        placeholder: param.desc,
        placeholder2: '',
        disabled: false,
        readonly: false,
      });
    });
    this.configurableParams.forEach((param) => {
      this.createBotForm.addControl(param.apiKey, this.fb.control(param.value||null, param.required ? Validators.required : null));
    });
  }

  onSubmit(){
    const payload = {};
    Object.keys(this.createBotForm.value).forEach((key) => {
      payload[key] = this.createBotForm.value[key];
    });
    payload['additionalParams'] = {};
    this.additionalParams.forEach((param) => {
      payload['additionalParams'][param.apiKey] = this.createBotForm.value[param.apiKey];
    });
    payload['configurableParams'] = {};
    this.configurableParams.forEach((param) => {
      payload['configurableParams'][param.apiKey] = this.createBotForm.value[param.apiKey];
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
    this.configurableParams = [];
    this.selectData.strategy = [];
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
      type: 'number',
      label: 'Main (T1) Timeframe (in seconds)',
      apiKey: 'timeframe',
      value: null,
      required: true,
      placeholder: 'Enter Timeframe (T1 in seconds)',
      placeholder2: 'Enter Timeframe (T1 in seconds)',
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

// example of configuration data
// {
//   "configuration": {
//       "brokers": [
//           {
//               "brokerName": "Deriv",
//               "desc": "Deriv Broker",
//               "strategies": [
//                   {
//                       "strategyName": "triple_ema",
//                       "desc": "Triple EMA Strategy",
//                       "contract_types": [
//                           "CALE",
//                           "PUTE"
//                       ],
//                       "supportingFeedKeys": [
//                           "T2"
//                       ],
//                       "configurableParams": [
//                           {
//                               "name": "T2",
//                               "type": "number",
//                               "title": "T2 Timeframe(in seconds)",
//                               "desc": "The timeframe for T2 feed (tide)",
//                               "required": true
//                           },
//                           {
//                               "name": "payout",
//                               "type": "number",
//                               "title": "Payout",
//                               "desc": "The minimum payout for the contract",
//                               "required": false,
//                               "default": 0.9
//                           }
//                       ]
//                   }
//               ],
//               "additionalParams": [
//                   {
//                       "name": "appId",
//                       "type": "number",
//                       "title": "Application ID",
//                       "desc": "The application ID provided by the broker.",
//                       "required": true
//                   },
//                   {
//                       "name": "authToken",
//                       "type": "text",
//                       "title": "Authentication Token",
//                       "desc": "The authentication token provided by the broker.",
//                       "required": true
//                   }
//               ]
//           }
//       ]
//   },
//   "success": true
// }