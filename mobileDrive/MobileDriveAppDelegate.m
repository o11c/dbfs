//
//  MobileDriveAppDelegate.m
//  mobileDrive
//
//  Created by Eric Klinginsmith on 3/6/14.
//  Copyright (c) 2014 Eric Klinginsmith. All rights reserved.

#import <string.h>
#import "MobileDriveAppDelegate.h"
#import "ServerViewController.h"
#import "IPadTableViewController.h"


@interface MobileDriveAppDelegate() <IPadTableViewControllerDelegate>

@property (strong, nonatomic) IPadTableViewController *iPadTableViewController;

@end

@implementation MobileDriveAppDelegate{
   NSString * ipAddress;
}

-(void)switchChanged:(UISwitch *)sender {

    self.isConnected = [sender isOn];

    NSLog(@"switchChanged %d", self.isConnected);
    if(self.isConnected){
        [self.serverController turnOnServer];
        //NSLog( [self.serverController getIPAddress] );
    }else{
        [self.serverController turnOffServer];
    }

    //FIXME add code to turn on/off server here
}

-(void)pathButtonPressed:(UIButton *)sender {

 [self.iPadNavController popToViewController:[self.iPadNavController.viewControllers objectAtIndex:sender.tag]
                                    animated:YES];

}

-(void)refreshIpad:(NSString *)path {

    [self.iPadTableViewController refresh:path];

}

-(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    
    // intit global app properties
    self.isConnected = YES;

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        dispatch_async(dispatch_get_main_queue(), ^{
            self.serverController = [[ServerViewController alloc] init];
            
            ipAddress = [ [NSString alloc] initWithString:[self.serverController getIPAddress] ];

        });
    });
    NSLog(@"#%%-------%");
    NSLog( ipAddress );
    NSLog(@"#%%-------%");
    
    
//  intit the model
    self.model = [[MobileDriveModel alloc] init];

    
    
    // init root table view controler
    self.iPadTableViewController = [[IPadTableViewController alloc] initWithPath:@"/"
                                                                        ipAddress:@"12.123.123.12"
                                                                    switchAction:@selector(switchChanged:)
                                                                       forEvents:UIControlEventValueChanged
                                                                      pathAction:@selector(pathButtonPressed:)
                                                                      pathEvents:UIControlEventTouchUpInside];

    // init nav controller
    _iPadNavController = [[UINavigationController alloc] initWithRootViewController:self.iPadTableViewController];
    _iPadNavController.title = @"NavController";
    [_iPadNavController.navigationBar setTitleTextAttributes:[NSDictionary dictionaryWithObjectsAndKeys:[UIFont systemFontOfSize:LARGE_FONT_SIZE],
                                                            NSFontAttributeName,
                                                            nil]];

    // set up window
    
    self.window.rootViewController = _iPadNavController;
    self.window.backgroundColor = [UIColor whiteColor];
    [self.window makeKeyAndVisible];

    return YES;

}

- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

@end
