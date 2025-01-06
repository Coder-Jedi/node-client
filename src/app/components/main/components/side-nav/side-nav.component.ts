import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent implements OnInit{

  navItems = [
    {
      name: 'Dashboard',
      route: 'dashboard'
    },
    {
      name: 'Create Bot',
      route: 'create-bot'
    }
  ];
  currRoute: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.handleRouteSelection();
  }

  navigate(item){
    this.router.navigate([`main/${item.route}`]);
    this.currRoute = item.route;
  }

  handleRouteSelection(){
    // Get the current route after entering the component
    let routeStr = String(this.router.url);
    this.currRoute = '';
    for(let item of this.navItems){
      if(routeStr.includes(item.route)){
        this.currRoute = item.route;
        break;
      }
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      let routeStr = String(event.urlAfterRedirects);
      this.currRoute = '';
      for(let item of this.navItems){
        if(routeStr.includes(item.route)){
          this.currRoute = item.route;
          break;
        }
      }
    });
  }

}
