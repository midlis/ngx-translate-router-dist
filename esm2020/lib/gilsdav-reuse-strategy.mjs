export class GilsdavReuseStrategy {
    // private handlers: {[key: string]: DetachedRouteHandle} = {};
    constructor() {
    }
    shouldDetach(route) {
        // console.log('shouldDetach', route);
        return false;
    }
    store(route, handle) {
        // console.log('store', route, handle);
        // console.log('store url', this.getKey(route));
        // this.handlers[this.getKey(route)] = handle;
    }
    shouldAttach(route) {
        // console.log('shouldAttach', route, this.getKey(route));
        // return !!this.handlers[this.getKey(route)];
        return false;
    }
    retrieve(route) {
        // console.log('retrieve', route);
        // console.log('retrieve url', this.getKey(route));
        // const result = this.handlers[this.getKey(route)];
        // delete this.handlers[this.getKey(route)];
        // return result;
        return null;
    }
    shouldReuseRoute(future, curr) {
        // console.log('shouldReuseRoute', future, curr, this.getKey(future) === this.getKey(curr));
        // console.log('shouldReuseRoute', future && curr ? this.getKey(future) === this.getKey(curr) : false);
        return future && curr ? this.getKey(future) === this.getKey(curr) : false;
    }
    getKey(route) {
        // console.log(route.parent.component.toString());
        if (route.firstChild && route.firstChild.routeConfig && route.firstChild.routeConfig.path &&
            route.firstChild.routeConfig.path.indexOf('**') !== -1) { // WildCard
            return 'WILDCARD';
        }
        else if (!route.data.localizeRouter && (!route.parent || !route.parent.parent) && !route.data.skipRouteLocalization) { // Lang route
            return 'LANG';
        }
        else if (route.routeConfig.matcher) {
            let keyM = `${this.getKey(route.parent)}/${route.routeConfig.matcher.name}`;
            if (route.data.discriminantPathKey) {
                keyM = `${keyM}-${route.data.discriminantPathKey}`;
            }
            return keyM;
        }
        else if (route.data.localizeRouter) {
            let key = `${this.getKey(route.parent)}/${route.data.localizeRouter.path}`;
            if (route.data.discriminantPathKey) {
                key = `${key}-${route.data.discriminantPathKey}`;
            }
            return key;
        }
        else {
            let key = route.routeConfig.path;
            if (route.parent) {
                key = `${this.getKey(route.parent)}/${route.routeConfig.path}`;
            }
            if (route.data.discriminantPathKey) {
                key = `${key}-${route.data.discriminantPathKey}`;
            }
            return key;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2lsc2Rhdi1yZXVzZS1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmFuc2xhdGUtcm91dGVyL3NyYy9saWIvZ2lsc2Rhdi1yZXVzZS1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLCtEQUErRDtJQUMvRDtJQUNBLENBQUM7SUFDRCxZQUFZLENBQUMsS0FBNkI7UUFDeEMsc0NBQXNDO1FBQ3RDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELEtBQUssQ0FBQyxLQUE2QixFQUFFLE1BQTJCO1FBQzlELHVDQUF1QztRQUN2QyxnREFBZ0Q7UUFDaEQsOENBQThDO0lBQ2hELENBQUM7SUFDRCxZQUFZLENBQUMsS0FBNkI7UUFDeEMsMERBQTBEO1FBQzFELDhDQUE4QztRQUM5QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFDRCxRQUFRLENBQUMsS0FBNkI7UUFDcEMsa0NBQWtDO1FBQ2xDLG1EQUFtRDtRQUNuRCxvREFBb0Q7UUFDcEQsNENBQTRDO1FBQzVDLGlCQUFpQjtRQUNqQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxNQUE4QixFQUFFLElBQTRCO1FBQzNFLDRGQUE0RjtRQUM1Rix1R0FBdUc7UUFDdkcsT0FBTyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUM1RSxDQUFDO0lBQ08sTUFBTSxDQUFDLEtBQTZCO1FBQzFDLGtEQUFrRDtRQUNsRCxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSTtZQUNyRixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsV0FBVztZQUN2RSxPQUFPLFVBQVUsQ0FBQztTQUNuQjthQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsYUFBYTtZQUNwSSxPQUFPLE1BQU0sQ0FBQztTQUNmO2FBQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUNwQyxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDbEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUNwRDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0UsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUNsQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQ2xEO1lBQ0QsT0FBTyxHQUFHLENBQUM7U0FDWjthQUFNO1lBQ0wsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDakMsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNoQixHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2hFO1lBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUNsQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQ2xEO1lBQ0QsT0FBTyxHQUFHLENBQUM7U0FDWjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlUmV1c2VTdHJhdGVneSwgRGV0YWNoZWRSb3V0ZUhhbmRsZSwgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmV4cG9ydCBjbGFzcyBHaWxzZGF2UmV1c2VTdHJhdGVneSBpbXBsZW1lbnRzIFJvdXRlUmV1c2VTdHJhdGVneSB7XG4gIC8vIHByaXZhdGUgaGFuZGxlcnM6IHtba2V5OiBzdHJpbmddOiBEZXRhY2hlZFJvdXRlSGFuZGxlfSA9IHt9O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuICBzaG91bGREZXRhY2gocm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBib29sZWFuIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc2hvdWxkRGV0YWNoJywgcm91dGUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdG9yZShyb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgaGFuZGxlOiBEZXRhY2hlZFJvdXRlSGFuZGxlKTogdm9pZCB7XG4gICAgLy8gY29uc29sZS5sb2coJ3N0b3JlJywgcm91dGUsIGhhbmRsZSk7XG4gICAgLy8gY29uc29sZS5sb2coJ3N0b3JlIHVybCcsIHRoaXMuZ2V0S2V5KHJvdXRlKSk7XG4gICAgLy8gdGhpcy5oYW5kbGVyc1t0aGlzLmdldEtleShyb3V0ZSldID0gaGFuZGxlO1xuICB9XG4gIHNob3VsZEF0dGFjaChyb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCk6IGJvb2xlYW4ge1xuICAgIC8vIGNvbnNvbGUubG9nKCdzaG91bGRBdHRhY2gnLCByb3V0ZSwgdGhpcy5nZXRLZXkocm91dGUpKTtcbiAgICAvLyByZXR1cm4gISF0aGlzLmhhbmRsZXJzW3RoaXMuZ2V0S2V5KHJvdXRlKV07XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHJpZXZlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KTogRGV0YWNoZWRSb3V0ZUhhbmRsZSB7XG4gICAgLy8gY29uc29sZS5sb2coJ3JldHJpZXZlJywgcm91dGUpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdyZXRyaWV2ZSB1cmwnLCB0aGlzLmdldEtleShyb3V0ZSkpO1xuICAgIC8vIGNvbnN0IHJlc3VsdCA9IHRoaXMuaGFuZGxlcnNbdGhpcy5nZXRLZXkocm91dGUpXTtcbiAgICAvLyBkZWxldGUgdGhpcy5oYW5kbGVyc1t0aGlzLmdldEtleShyb3V0ZSldO1xuICAgIC8vIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgc2hvdWxkUmV1c2VSb3V0ZShmdXR1cmU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGN1cnI6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QpOiBib29sZWFuIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc2hvdWxkUmV1c2VSb3V0ZScsIGZ1dHVyZSwgY3VyciwgdGhpcy5nZXRLZXkoZnV0dXJlKSA9PT0gdGhpcy5nZXRLZXkoY3VycikpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdzaG91bGRSZXVzZVJvdXRlJywgZnV0dXJlICYmIGN1cnIgPyB0aGlzLmdldEtleShmdXR1cmUpID09PSB0aGlzLmdldEtleShjdXJyKSA6IGZhbHNlKTtcbiAgICByZXR1cm4gZnV0dXJlICYmIGN1cnIgPyB0aGlzLmdldEtleShmdXR1cmUpID09PSB0aGlzLmdldEtleShjdXJyKSA6IGZhbHNlO1xuICB9XG4gIHByaXZhdGUgZ2V0S2V5KHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7XG4gICAgLy8gY29uc29sZS5sb2cocm91dGUucGFyZW50LmNvbXBvbmVudC50b1N0cmluZygpKTtcbiAgICBpZiAocm91dGUuZmlyc3RDaGlsZCAmJiByb3V0ZS5maXJzdENoaWxkLnJvdXRlQ29uZmlnICYmIHJvdXRlLmZpcnN0Q2hpbGQucm91dGVDb25maWcucGF0aCAmJlxuICAgICAgICByb3V0ZS5maXJzdENoaWxkLnJvdXRlQ29uZmlnLnBhdGguaW5kZXhPZignKionKSAhPT0gLTEpIHsgLy8gV2lsZENhcmRcbiAgICAgIHJldHVybiAnV0lMRENBUkQnO1xuICAgIH0gZWxzZSBpZiAoIXJvdXRlLmRhdGEubG9jYWxpemVSb3V0ZXIgJiYgKCFyb3V0ZS5wYXJlbnQgfHwgIXJvdXRlLnBhcmVudC5wYXJlbnQpICYmICFyb3V0ZS5kYXRhLnNraXBSb3V0ZUxvY2FsaXphdGlvbikgeyAvLyBMYW5nIHJvdXRlXG4gICAgICByZXR1cm4gJ0xBTkcnO1xuICAgIH0gZWxzZSBpZiAocm91dGUucm91dGVDb25maWcubWF0Y2hlcikge1xuICAgICAgbGV0IGtleU0gPSBgJHt0aGlzLmdldEtleShyb3V0ZS5wYXJlbnQpfS8ke3JvdXRlLnJvdXRlQ29uZmlnLm1hdGNoZXIubmFtZX1gO1xuICAgICAgaWYgKHJvdXRlLmRhdGEuZGlzY3JpbWluYW50UGF0aEtleSkge1xuICAgICAgICBrZXlNID0gYCR7a2V5TX0tJHtyb3V0ZS5kYXRhLmRpc2NyaW1pbmFudFBhdGhLZXl9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXlNO1xuICAgIH0gZWxzZSBpZiAocm91dGUuZGF0YS5sb2NhbGl6ZVJvdXRlcikge1xuICAgICAgbGV0IGtleSA9IGAke3RoaXMuZ2V0S2V5KHJvdXRlLnBhcmVudCl9LyR7cm91dGUuZGF0YS5sb2NhbGl6ZVJvdXRlci5wYXRofWA7XG4gICAgICBpZiAocm91dGUuZGF0YS5kaXNjcmltaW5hbnRQYXRoS2V5KSB7XG4gICAgICAgIGtleSA9IGAke2tleX0tJHtyb3V0ZS5kYXRhLmRpc2NyaW1pbmFudFBhdGhLZXl9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBrZXkgPSByb3V0ZS5yb3V0ZUNvbmZpZy5wYXRoO1xuICAgICAgaWYgKHJvdXRlLnBhcmVudCkge1xuICAgICAgICBrZXkgPSBgJHt0aGlzLmdldEtleShyb3V0ZS5wYXJlbnQpfS8ke3JvdXRlLnJvdXRlQ29uZmlnLnBhdGh9YDtcbiAgICAgIH1cbiAgICAgIGlmIChyb3V0ZS5kYXRhLmRpc2NyaW1pbmFudFBhdGhLZXkpIHtcbiAgICAgICAga2V5ID0gYCR7a2V5fS0ke3JvdXRlLmRhdGEuZGlzY3JpbWluYW50UGF0aEtleX1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==