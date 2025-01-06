import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BotService {

  constructor(
    private http: HttpClient
  ) { }

  fetchConfigurationData() {
    return this.http.get(environment.API_HOST + '/btbot/configuration');
  }

  createBot(payload) {
    return this.http.post(environment.API_HOST + '/btbot/create', payload);
  }

  fetchBotList() {
    return this.http.get(environment.API_HOST + '/btbot/list');
  }

  getBotDetails(botId) {
    return this.http.get(environment.API_HOST + '/btbot/details?botId=' + botId);
  }

  startBot(payload) {
    return this.http.post(environment.API_HOST + '/btbot/start', payload);
  }

  stopBot(payload) {
    return this.http.post(environment.API_HOST + '/btbot/stop', payload);
  }

}
