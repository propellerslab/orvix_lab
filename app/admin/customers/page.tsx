// app/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Building2,
  Shield,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  Package,
  Layers,
  Clock,
  Filter,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminCustomersPage() {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [clientRequests, setClientRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      console.error('Failed to fetch client profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Inspect client history & specs
  const handleInspectClient = async (profile: any) => {
    setSelectedClient(profile);
    setUpdateMsg(null);

    // Fetch client orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    // Fetch custom CAD requests submitted by this client
    const { data: requests } = await supabase
      .from('custom_requests')
      .select('id, project_title, target_material, status, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    setClientOrders(orders || []);
    setClientRequests(requests || []);
  };

  // Update Role in Supabase
  const handleRoleChange = async (profileId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      setUpdateMsg(`Access tier updated to ${newRole.toUpperCase()}`);
      setTimeout(() => setUpdateMsg(null), 3000);

      // Refresh local state
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
      if (selectedClient && selectedClient.id === profileId) {
        setSelectedClient({ ...selectedClient, role: newRole });
      }
    } catch (err: any) {
      alert(`Role transition failed: ${err.message}`);
    }
  };

  // Filtered profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      (p.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'ALL' || p.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E20000]">
            // OPERATOR REGISTRY &bull; B2B CLIENTS
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[#242424] sm:text-4xl">
            Client Accounts
          </h1>
          <p className="mt-1 font-serif text-xs text-zinc-500">
            Manage authenticated operators, B2B wholesale access, and production credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs text-zinc-600 shadow-sm">
          <Users className="h-4 w-4 text-[#002339]" />
          <span>TOTAL REGISTRY: <strong>{profiles.length}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by operator name, email, or company..."
            className="w-full border border-zinc-300 bg-white pl-9 pr-3 py-2 font-mono text-xs text-[#242424] placeholder-zinc-400 focus:border-[#002339] focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">TIER:</span>
          {['ALL', 'customer', 'b2b_client', 'admin'].map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setSelectedRoleFilter(roleKey)}
              className={`border px-3 py-1 font-mono text-[11px] uppercase transition-colors ${
                selectedRoleFilter === roleKey
                  ? 'border-[#002339] bg-[#002339] text-white font-bold'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {roleKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Accounts Table + Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table Column */}
        <div className="lg:col-span-8 border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-4 font-mono text-xs text-zinc-500 flex justify-between">
            <span>REGISTERED CLIENT OPERATORS ({filteredProfiles.length})</span>
            <span>RLS ACTIVE</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center font-mono text-xs text-zinc-500">
              // HYDRATING OPERATOR REGISTRY...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-zinc-500">
              No matching client profiles found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/70 max-h-[750px] overflow-y-auto">
              {filteredProfiles.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => handleInspectClient(client)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-l-4 border-[#E20000] bg-zinc-50'
                        : 'hover:bg-zinc-50/60'
                    }`}
                  >
                    {/* Identity */}
                    <div className="flex items-center gap-3">
                      {client.avatar_url ? (
                        <Image
                          src={client.avatar_url}
                          alt={client.full_name || 'Client'}
                          width={38}
                          height={38}
                          className="border border-zinc-200 rounded-none shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 border border-zinc-300 bg-zinc-100 flex items-center justify-center font-mono text-xs font-bold text-[#002339] shrink-0">
                          {client.full_name?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-sm font-bold text-[#242424]">
                            {client.full_name || 'Anonymous Operator'}
                          </p>
                          {client.company_name && (
                            <span className="flex items-center gap-1 border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-[#002339]">
                              <Building2 className="h-3 w-3" />
                              {client.company_name}
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-xs text-zinc-500 mt-0.5">
                          {client.email}
                        </p>
                      </div>
                    </div>

                    {/* Meta & Role Pill */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                            client.role === 'admin'
                              ? 'border-[#E20000] bg-[#E20000]/10 text-[#E20000]'
                              : client.role === 'b2b_client'
                              ? 'border-[#002339] bg-[#002339]/10 text-[#002339]'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                          }`}
                        >
                          {client.role.replace('_', ' ')}
                        </span>
                        <p className="font-mono text-[10px] text-zinc-400 mt-1">
                          Joined: {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Client Detail & Telemetry Column */}
        <div className="lg:col-span-4">
          {selectedClient ? (
            <div className="border border-zinc-200 bg-white p-6 shadow-sm space-y-6 sticky top-28">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#E20000]">
                    CLIENT TELEMETRY
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#242424]">
                    {selectedClient.full_name || 'Anonymous Client'}
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">{selectedClient.email}</p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1 text-zinc-400 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {updateMsg && (
                <div className="flex items-center gap-2 border border-emerald-600 bg-emerald-50 p-2.5 font-mono text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{updateMsg}</span>
                </div>
              )}

              {/* Role Elevation Selector */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                  ACCESS TIER &amp; WHOLESALE STATUS
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  {['customer', 'b2b_client', 'admin'].map((roleKey) => (
                    <button
                      key={roleKey}
                      onClick={() => handleRoleChange(selectedClient.id, roleKey)}
                      className={`border py-2 text-center uppercase font-bold transition-colors ${
                        selectedClient.role === roleKey
                          ? 'border-[#002339] bg-[#002339] text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {roleKey.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials & B2B Profile */}
              <div className="border border-zinc-200 bg-[#FAFAFA] p-3 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">PHONE:</span>
                  <span className="text-[#242424] font-semibold">{selectedClient.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">COMPANY:</span>
                  <span className="text-[#002339] font-bold">{selectedClient.company_name || 'Standard Client'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">VAT / TAX ID:</span>
                  <span className="text-[#242424]">{selectedClient.tax_id || 'Not Registered'}</span>
                </div>
              </div>

              {/* Default Delivery Destination */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
                  DEFAULT DISPATCH DESTINATION
                </span>
                {selectedClient.default_shipping_address &&
                Object.keys(selectedClient.default_shipping_address).length > 0 ? (
                  <div className="border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-600 space-y-1">
                    <p className="font-bold text-[#242424]">
                      {selectedClient.default_shipping_address.street}
                    </p>
                    <p>
                      {selectedClient.default_shipping_address.city},{' '}
                      {selectedClient.default_shipping_address.state}{' '}
                      {selectedClient.default_shipping_address.postalCode}
                    </p>
                    <p>{selectedClient.default_shipping_address.country}</p>
                    {selectedClient.default_shipping_address.defaultMaterial && (
                      <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between text-[10px]">
                        <span className="text-zinc-400 uppercase">PREF MATERIAL:</span>
                        <span className="text-[#E20000] font-bold">
                          {selectedClient.default_shipping_address.defaultMaterial}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-zinc-400 italic">
                    No default shipping address logged yet.
                  </p>
                )}
              </div>

              {/* Order History Summary */}
              <div className="space-y-2 border-t border-zinc-200 pt-4">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-[#002339]" />
                  <span>FABRICATION ORDERS ({clientOrders.length})</span>
                </span>

                {clientOrders.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-400 italic">No orders logged.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                    {clientOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex justify-between items-center border border-zinc-200 p-2 bg-[#FAFAFA]"
                      >
                        <span className="font-bold text-[#242424]">{ord.order_number}</span>
                        <span className="text-[#E20000] font-semibold">
                          Rs.{Number(ord.total_amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom CAD Quotes History */}
              <div className="space-y-2 border-t border-zinc-200 pt-4">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#E20000]" />
                  <span>CUSTOM CAD INTAKES ({clientRequests.length})</span>
                </span>

                {clientRequests.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-400 italic">No custom CAD quotes submitted.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                    {clientRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center border border-zinc-200 p-2 bg-[#FAFAFA]"
                      >
                        <span className="font-medium text-[#242424] truncate max-w-[160px]">
                          {req.project_title}
                        </span>
                        <span className="text-[9px] uppercase px-1 border border-zinc-200 bg-white text-zinc-600">
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-zinc-200 bg-white p-12 text-center font-mono text-xs text-zinc-400 shadow-sm">
              <Users className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
              <span>Select an operator from the registry to inspect profile telemetry.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
