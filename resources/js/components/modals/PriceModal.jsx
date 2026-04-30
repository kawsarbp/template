import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, DollarSign, Calculator } from "lucide-react";

export const PaymentModal = ({ price, balance, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="text-green-600" size={20} /> Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="finance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="finance" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold">
                <Calculator size={14} className="mr-2"/> Finance
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold">
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="finance" className="space-y-6">
              {/* Table Style Summary */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50/50 px-4 py-3 flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <div className="w-1/3">Items</div>
                  <div className="w-1/4 text-right">Amount</div>
                  <div className="w-1/4 text-right">Paid</div>
                  <div className="w-1/4 text-right">Balance</div>
                </div>
                
                <div className="bg-white px-4 py-4 flex justify-between text-sm font-medium border-b border-gray-100 items-center">
                  <div className="w-1/3 flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 p-1 rounded"><DollarSign size={14}/></span>
                    Vehicle Price
                  </div>
                  <div className="w-1/4 text-right font-bold">${price}</div>
                  <div className="w-1/4 text-right text-green-600 font-bold">$0</div>
                  <div className="w-1/4 text-right text-red-500 font-bold">${price}</div>
                </div>

                <div className="bg-green-50/30 px-4 py-4 flex justify-between text-sm font-bold">
                  <div className="w-1/3 text-green-800 flex items-center gap-2">
                    <Calculator size={16}/> Grand Total
                  </div>
                  <div className="w-1/4 text-right text-green-700">${price}</div>
                  <div className="w-1/4 text-right text-green-700">$0</div>
                  <div className="w-1/4 text-right text-red-600">${price}</div>
                </div>
              </div>

              {/* Alert Box */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-orange-700 font-bold text-sm">Payment Required</h4>
                  <p className="text-orange-600/80 text-xs mt-1">${price} Balance Remaining to clear this vehicle.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payments">
               <div className="text-center py-10 text-gray-400 text-sm">No payment history found.</div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};