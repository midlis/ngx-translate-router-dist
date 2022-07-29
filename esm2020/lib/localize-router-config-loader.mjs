import { ROUTES } from '@angular/router';
import { NgModuleFactory, Compiler } from '@angular/core';
import { LocalizeParser } from './localize-router.parser';
export class LocalizeNgModuleFactory extends NgModuleFactory {
    constructor(moduleType) {
        super();
        this.moduleType = moduleType;
        this.create = (parentInjector) => {
            const compiler = parentInjector.get(Compiler);
            const localize = parentInjector.get(LocalizeParser);
            const compiled = compiler.compileModuleAndAllComponentsSync(this.moduleType);
            const moduleRef = compiled.ngModuleFactory.create(parentInjector);
            const getMethod = moduleRef.injector.get.bind(moduleRef.injector);
            moduleRef.injector['get'] = (token, notFoundValue) => {
                const getResult = getMethod(token, notFoundValue);
                if (token === ROUTES) {
                    // translate lazy routes
                    return localize.initChildRoutes([].concat(...getResult));
                }
                else {
                    return getResult;
                }
            };
            return moduleRef;
        };
    }
}
export function translateModule(moduleType) {
    return new LocalizeNgModuleFactory(moduleType);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemUtcm91dGVyLWNvbmZpZy1sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtdHJhbnNsYXRlLXJvdXRlci9zcmMvbGliL2xvY2FsaXplLXJvdXRlci1jb25maWctbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsZUFBZSxFQUFZLFFBQVEsRUFDcEMsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRTFELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxlQUFvQjtJQUMvRCxZQUFtQixVQUFxQjtRQUN0QyxLQUFLLEVBQUUsQ0FBQztRQURTLGVBQVUsR0FBVixVQUFVLENBQVc7UUFHeEMsV0FBTSxHQUFHLENBQUMsY0FBd0IsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sU0FBUyxHQUFxQixRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFVLEVBQUUsYUFBa0IsRUFBRSxFQUFFO2dCQUM3RCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUU7b0JBQ3BCLHdCQUF3QjtvQkFDeEIsT0FBTyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUMxRDtxQkFBTTtvQkFDTCxPQUFPLFNBQVMsQ0FBQztpQkFDbEI7WUFDSCxDQUFDLENBQUM7WUFFRixPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDLENBQUE7SUFuQkQsQ0FBQztDQW9CRjtBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsVUFBcUI7SUFDbkQsT0FBTyxJQUFJLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBST1VURVMgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHtcbiAgTmdNb2R1bGVGYWN0b3J5LCBJbmplY3RvciwgQ29tcGlsZXIsIFR5cGUsIE5nTW9kdWxlUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9jYWxpemVQYXJzZXIgfSBmcm9tICcuL2xvY2FsaXplLXJvdXRlci5wYXJzZXInO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxpemVOZ01vZHVsZUZhY3RvcnkgZXh0ZW5kcyBOZ01vZHVsZUZhY3Rvcnk8YW55PiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2R1bGVUeXBlOiBUeXBlPGFueT4pIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIGNyZWF0ZSA9IChwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICBjb25zdCBjb21waWxlciA9IHBhcmVudEluamVjdG9yLmdldChDb21waWxlcik7XG4gICAgY29uc3QgbG9jYWxpemUgPSBwYXJlbnRJbmplY3Rvci5nZXQoTG9jYWxpemVQYXJzZXIpO1xuICAgIGNvbnN0IGNvbXBpbGVkID0gY29tcGlsZXIuY29tcGlsZU1vZHVsZUFuZEFsbENvbXBvbmVudHNTeW5jKHRoaXMubW9kdWxlVHlwZSk7XG4gICAgY29uc3QgbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+ID0gY29tcGlsZWQubmdNb2R1bGVGYWN0b3J5LmNyZWF0ZShwYXJlbnRJbmplY3Rvcik7XG4gICAgY29uc3QgZ2V0TWV0aG9kID0gbW9kdWxlUmVmLmluamVjdG9yLmdldC5iaW5kKG1vZHVsZVJlZi5pbmplY3Rvcik7XG4gICAgbW9kdWxlUmVmLmluamVjdG9yWydnZXQnXSA9ICh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGdldFJlc3VsdCA9IGdldE1ldGhvZCh0b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG5cbiAgICAgIGlmICh0b2tlbiA9PT0gUk9VVEVTKSB7XG4gICAgICAgIC8vIHRyYW5zbGF0ZSBsYXp5IHJvdXRlc1xuICAgICAgICByZXR1cm4gbG9jYWxpemUuaW5pdENoaWxkUm91dGVzKFtdLmNvbmNhdCguLi5nZXRSZXN1bHQpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXRSZXN1bHQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtb2R1bGVSZWY7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZU1vZHVsZShtb2R1bGVUeXBlOiBUeXBlPGFueT4pwqB7XG4gIHJldHVybiBuZXcgTG9jYWxpemVOZ01vZHVsZUZhY3RvcnkobW9kdWxlVHlwZSk7XG59XG4iXX0=