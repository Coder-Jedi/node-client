import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BotService } from 'src/app/core/services/bot.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  botList : any[] = [];

  selectedBot : any;

  showBotDetails = false;

  loading = true;

  constructor(
    private botService: BotService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getBotList();
  }

  getBotList() {
    this.botService.fetchBotList().subscribe({
      next: (res:any) => {
        if(res && res?.success){
          this.botList = res?.data || [];
        }
        else{
          this.toastr.error('Failed to fetch bot list', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to fetch bot list', 'Error');
        this.loading = false;
      }
    });
  }

  handleAction(action, bot) {
    switch(action){
      case 'view':
        this.selectedBot = bot;
        this.showBotDetails = true;
        break;
      default:
        break;
    }

  }

  goToBotList() {
    this.showBotDetails = false;
    this.selectedBot = null;
    this.getBotList();
  }

}
