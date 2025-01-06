import { Component, Input, OnInit,  ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BotService } from 'src/app/core/services/bot.service';

@Component({
  selector: 'app-bot-details',
  templateUrl: './bot-details.component.html',
  styleUrl: './bot-details.component.scss'
})
export class BotDetailsComponent implements OnInit {

  @Input() botId;
  @ViewChild('openModalButton') openModalButton;
  @ViewChild('closeModalButton') closeModalButton;
  botDetails;
  botOrders : any[] = [];
  runningLogs : any[] = [];

  modalType = "";
  modalMessage = "";

  loading = true;

  q: any;

  tabs = [
    {id: 'overview', title: 'Overview'},
    {id: 'running-logs', title: 'Running Logs'},
    {id: 'orders', title: 'Orders'},
  ];
  activeTab = this.tabs[0];

  constructor(
    private botService: BotService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getBotDetails();
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  refreshData() {
    this.loading = true;
    this.getBotDetails();
  }

  getBotDetails() {
    this.botService.getBotDetails(this.botId).subscribe({
      next: (res:any) => {
        if(res && res?.success){
          this.botDetails = res?.data?.bot;

          // sort running logs by timestamp (newest first)
          this.runningLogs = res?.data?.bot?.runningLogs || [];
          this.runningLogs.sort((a, b) => b.timestamp - a.timestamp);

          // sort orders by timestamp (newest first)
          this.botOrders = res?.data?.orders || [];
          this.botOrders.sort((a, b) => b?.binaryOrder?.startTime - a?.binaryOrder?.startTime);
        }
        else{
          this.toastr.error('Failed to fetch bot details', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to fetch bot details', 'Error');
        this.loading = false;
      }
    });
  }

  handleAction(action) {
    switch(action){
      case 'start':
        // start bot
        this.modalMessage = "";
        this.modalType = "start";
        this.openModalButton.nativeElement.click();
        break;
      case 'stop':
        // stop bot
        this.modalMessage = "";
        this.modalType = "stop";
        this.openModalButton.nativeElement.click();
        break;
      case 'modalSubmit':
        // submit modal
        if(this.modalType === 'start'){
          this.startBot();
        }
        else if(this.modalType === 'stop'){
          this.stopBot();
        }
        this.closeModalButton.nativeElement.click();
        break;
      default:
        break;
    }
  }

  resetModal() {
    setTimeout(() => {
      this.modalType = "";
      this.modalMessage = "";
    }, 200);
  }

  startBot() {
    this.loading = true;

    let payload = {
      botId: this.botId,
      message: this.modalMessage,
      data: {}
    };
    this.botService.startBot(payload).subscribe({
      next: (res:any) => {
        if(res && res?.success){
          this.toastr.success('Bot started successfully', 'Success');
          this.getBotDetails();
        }
        else{
          let errorMessage = 'Failed to start bot. ' + res?.message;
          this.toastr.error(errorMessage, 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to start bot. ' + error?.error?.message || error?.message;
        this.toastr.error(errorMessage, 'Error');
        this.loading = false;
      }
    });
  }
  stopBot() {
    this.loading = true;

    let payload = {
      botId: this.botId,
      message: this.modalMessage,
      data: {}
    };
    this.botService.stopBot(payload).subscribe({
      next: (res:any) => {
        if(res && res?.success){
          this.toastr.success('Bot stopped successfully', 'Success');
          this.getBotDetails();
        }
        else{
          let errorMessage = 'Failed to stop bot. ' + res?.message;
          this.toastr.error(errorMessage, 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to stop bot. ' + error?.error?.message || error?.message;
        this.toastr.error(errorMessage, 'Error');
        this.loading = false;
      }
    });
  }

  convertTimestampToLocaleString(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
  convertUnixTimestampToLocaleString(timestamp: number): string {
    return new Date(timestamp*1000).toLocaleString();
  }

  // configuration keys for bot to be displayed in the table as key-value pair
  configurationKeys = [
    {
      key: 'botName',
      title: 'Bot Name'
    },
    {
      key: 'botId',
      title: 'Bot ID'
    },
    {
      key: 'broker',
      title: 'Broker'
    },
    {
      key: 'strategy',
      title: 'Strategy'
    },
    {
      key: 'symbol',
      title: 'Symbol'
    },
    {
      key: 'timeframe',
      title: 'Timeframe'
    },
  ];

}


// example bot object
// "bot": {
//             "_id": "6770d3895820bdad0d528694",
//             "symbol": "R_10",
//             "timeframe": "M1",
//             "strategy": "reversal_mean_reversion",
//             "broker": "deriv",
//             "botName": "Reversal Mean Reversion Bot",
//             "params": {
//                 "appId": "51523",
//                 "authToken": "8tb79coZRZZEbmi"
//             },
//             "botId": "7a129efc-2fa3-4143-b7e0-4015fcb4f1f0",
//             "runningLogs": [
//                 {
//                     "type": "START",
//                     "timestamp": 1735448104288,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770d6285820bdad0d528698"
//                 },
//                 {
//                     "type": "START",
//                     "timestamp": 1735450197466,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770de555fbf061e9a872dc1"
//                 },
//                 {
//                     "type": "START",
//                     "timestamp": 1735450292026,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770deb4c049f5bcce00c40a"
//                 },
//                 {
//                     "type": "START",
//                     "timestamp": 1735458397423,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770fe5dc049f5bcce00c41a"
//                 },
//                 {
//                     "type": "STOP",
//                     "timestamp": 1735458456412,
//                     "message": "Live trader stopped",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770fe98c049f5bcce00c421"
//                 },
//                 {
//                     "type": "STOP",
//                     "timestamp": 1735458570084,
//                     "message": "Stopping Bot",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770ff0ac049f5bcce00c429"
//                 },
//                 {
//                     "type": "START",
//                     "timestamp": 1735458591385,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770ff1fc049f5bcce00c432"
//                 },
//                 {
//                     "type": "STOP",
//                     "timestamp": 1735458595014,
//                     "message": "Stopping Bot",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6770ff23c049f5bcce00c43c"
//                 },
//                 {
//                     "type": "START",
//                     "timestamp": 1735460939909,
//                     "message": "Starting Bot for first time",
//                     "data": {
//                         "actionType": "manual"
//                     },
//                     "_id": "6771084b38fdf1877f35e881"
//                 }
//             ],
//             "created_at": "2024-12-29T04:43:53.085Z",
//             "updated_at": "2024-12-29T08:28:59.917Z",
//             "__v": 9,
//             "status": "INACTIVE"
//         },